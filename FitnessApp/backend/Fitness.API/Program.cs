using Fitness.Core.Entities;
using Fitness.Core.Interfaces;
using Fitness.Core.Services;
using Fitness.Infrastructure.Data;
using Fitness.Infrastructure.External;
using Fitness.Infrastructure.Identity;
using Fitness.Infrastructure.Repositories;
using Fitness.Infrastructure.Seed;
using Fitness.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// 1. Конфигурация базы данных (должно быть ПЕРВЫМ)
builder.Services.AddDbContext<FitnessContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQL")));

// 2. Identity configuration
builder.Services.AddIdentity<AppUser, IdentityRole<int>>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<FitnessContext>()
.AddDefaultTokenProviders();

// 3. Регистрация репозиториев с явным указанием контекста
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IRepository<Token>>(provider =>
    new Repository<Token>(provider.GetRequiredService<FitnessContext>()));
builder.Services.AddScoped<IRepository<Center>>(provider =>
    new Repository<Center>(provider.GetRequiredService<FitnessContext>()));
builder.Services.AddScoped<IRepository<Trainer>>(provider =>
    new Repository<Trainer>(provider.GetRequiredService<FitnessContext>()));
builder.Services.AddScoped<IRepository<Template>>(provider =>
    new Repository<Template>(provider.GetRequiredService<FitnessContext>()));
builder.Services.AddScoped<IRepository<Training>>(provider =>
    new Repository<Training>(provider.GetRequiredService<FitnessContext>()));
builder.Services.AddScoped<IRepository<Order>>(provider =>
    new Repository<Order>(provider.GetRequiredService<FitnessContext>()));

// Увеличиваем лимиты для загрузки файлов
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 20_000_000; // 20MB
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 20_000_000; // 20MB
    options.MemoryBufferThreshold = 2_000_000; // 2MB
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

builder.Services.AddHttpClient("WebDAV")
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
    {
        PreAuthenticate = true,
        UseDefaultCredentials = false,
        Credentials = new NetworkCredential(
            builder.Configuration["YandexCloud:Username"],
            builder.Configuration["YandexCloud:Password"]
        ),
        ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
    });

// 4. Регистрация сервисов
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICenterService, CenterService>();
builder.Services.AddScoped<ITrainerService, TrainerService>();
builder.Services.AddScoped<ITemplateService, TemplateService>();
builder.Services.AddScoped<ITrainingService, TrainingService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddSingleton<ICloudStorageService>(new WebDavStorageService(
    builder.Configuration["YandexCloud:WebDavUrl"],
    builder.Configuration["YandexCloud:Username"],
    builder.Configuration["YandexCloud:Password"],
    "trainers"
));

// 5. JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy =>
        policy.RequireAssertion(context =>
            context.User.HasClaim(c =>
                c.Type == ClaimTypes.Role && c.Value == UserRole.Admin.ToString())));
});


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHttpContextAccessor();

// 7. Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Fitness API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 8. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Применение миграций
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<FitnessContext>();
        context.Database.Migrate();
        await SeedData.Initialize(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ошибка при применении миграций");
    }
}

// Конфигурация middleware
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Fitness API");
    c.RoutePrefix = "swagger";
});

app.MapControllers();

app.Run();