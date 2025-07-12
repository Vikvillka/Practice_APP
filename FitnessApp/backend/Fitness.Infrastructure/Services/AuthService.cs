using Fitness.Core.Entities;
using Fitness.Core.Exceptions;
using Fitness.Core.Interfaces;
using Fitness.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;

namespace Fitness.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ITokenService _tokenService;

        public AuthService(
            UserManager<AppUser> userManager,
            IConfiguration configuration,
            ITokenService tokenService)
        {
            _userManager = userManager;
            _configuration = configuration;
            _tokenService = tokenService;
        }

        public async Task<(string accessToken, string refreshToken, User User)> RegisterAsync(User user, string password, string ipAddress)
        {
            var appUser = AppUser.FromAppUser(user);

            if (await _userManager.FindByEmailAsync(user.Email) != null)
            {
                throw new ApiException("USER_ALREADY_EXISTS",
                    $"Почта '{user.Email}' уже используется",
                    HttpStatusCode.BadRequest);
            }

            var result = await _userManager.CreateAsync(appUser, password);

            if (!result.Succeeded)
            {
                throw new ApiException("REGISTRATION_FAILED",
                    string.Join(", ", result.Errors.Select(e => e.Description)),
                    HttpStatusCode.BadRequest);
            }

            var accessToken = GenerateJwtToken(appUser);
            var refreshTokenEntity = await _tokenService.GenerateRefreshTokenAsync(appUser.Id, ipAddress);

            return (accessToken, refreshTokenEntity.RefreshToken, appUser.ToUser());
        }

        public async Task<(string accessToken, string refreshToken, User User)> LoginAsync(string email, string password, string ipAddress)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, password))
            {
                throw new ApiException("LOGIN_FAILED",
                    "Неверный email или пароль",
                    HttpStatusCode.Unauthorized);
            }

            await _tokenService.RevokeAllTokensForUserAsync(user.Id, ipAddress);

            var accessToken = GenerateJwtToken(user);
            var refreshTokenEntity = await _tokenService.GenerateRefreshTokenAsync(user.Id, ipAddress);

            return (accessToken, refreshTokenEntity.RefreshToken, user.ToUser());
        }

        public async Task<(string newAccessToken, string newRefreshToken, User User)> RefreshTokenAsync(string accessToken, string refreshToken, string ipAddress)
        {
            var principal = GetPrincipalFromExpiredToken(accessToken);
            var userId = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var oldToken = await _tokenService.GetActiveTokenAsync(refreshToken);
            if (oldToken == null || oldToken.UserId != userId)
            {
                throw new ApiException("INVALID_REFRESH_TOKEN",
                    "Недействительный refresh token",
                    HttpStatusCode.Unauthorized);
            }

            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new ApiException("USER_NOT_FOUND",
                    "Пользователь не найден",
                    HttpStatusCode.NotFound);
            }

            await _tokenService.RevokeTokenAsync(refreshToken, ipAddress, "replaced_by_new_token");

            var newAccessToken = GenerateJwtToken(user);
            var newRefreshTokenEntity = await _tokenService.GenerateRefreshTokenAsync(user.Id, ipAddress);

            return (newAccessToken, newRefreshTokenEntity.RefreshToken, user.ToUser());
        }

        public async Task RevokeTokenAsync(string refreshToken, string ipAddress)
        {
            await _tokenService.RevokeTokenAsync(refreshToken, ipAddress);
        }

        public async Task LogoutAsync(string refreshToken, string ipAddress)
        {
            if (string.IsNullOrEmpty(refreshToken))
            {
                throw new ApiException("INVALID_TOKEN", "Refresh token не предоставлен", HttpStatusCode.BadRequest);
            }

            await _tokenService.RevokeTokenAsync(refreshToken, ipAddress);
            
            var token = await _tokenService.GetActiveTokenAsync(refreshToken);
            if (token != null)
            {
                await _tokenService.RevokeAllTokensForUserAsync(token.UserId, ipAddress);
            }
        }

        private string GenerateJwtToken(AppUser user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpireMinutes"])),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])),
                ValidateLifetime = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            return tokenHandler.ValidateToken(token, tokenValidationParameters, out _);
        }
    }
}