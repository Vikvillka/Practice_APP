using Fitness.Core.Entities;
using Fitness.Core.Interfaces;
using Fitness.Infrastructure.Data;
using Fitness.Infrastructure.Identity;
using Fitness.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Fitness.Infrastructure.Seed
{
    public class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var services = scope.ServiceProvider;

            try
            {
                var context = services.GetRequiredService<FitnessContext>();
                var userManager = services.GetRequiredService<UserManager<AppUser>>();
                var authService = services.GetRequiredService<IAuthService>();
                var logger = services.GetRequiredService<ILogger<SeedData>>();

                await context.Database.MigrateAsync();

                const string adminEmail = "admin@gmail.com";
                const string adminPassword = "Admin1111$";
                const string ipAddress = "127.0.0.1"; 

                var adminUser = await userManager.FindByEmailAsync(adminEmail);
                if (adminUser == null)
                {
                    adminUser = new AppUser
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        FirstName = "Admin",
                        LastName = "System",
                        Role = UserRole.Admin
                    };

                    var createResult = await userManager.CreateAsync(adminUser, adminPassword);
                    if (!createResult.Succeeded)
                    {
                        throw new Exception($"Ошибка создания администратора: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
                    }

                    var (accessToken, refreshToken, _) = await authService.RegisterAsync(
                        adminUser.ToUser(),
                        adminPassword,
                        ipAddress);

                    logger.LogInformation("Администратор создан успешно. Access Token: {Token}", accessToken);
                    logger.LogInformation("Refresh Token: {RefreshToken}", refreshToken);
                }
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<SeedData>>();
                logger.LogError(ex, "Ошибка инициализации администратора");
                throw; 
            }
        }
    }
}