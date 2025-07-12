using Fitness.Core.Entities;
using Fitness.Core.Exceptions;
using Fitness.Core.Interfaces;
using System.Net;
using System.Security.Cryptography;

namespace Fitness.Infrastructure.Services
{
    public class TokenService : ITokenService
    {
        private readonly IRepository<Token> _tokenRepository;

        public TokenService(IRepository<Token> tokenRepository)
        {
            _tokenRepository = tokenRepository;
        }

        public async Task<Token> GenerateRefreshTokenAsync(int userId, string ipAddress)
        {
            var token = new Token
            {
                RefreshToken = GenerateRandomToken(),
                Expires = DateTime.UtcNow.AddDays(7),
                Created = DateTime.UtcNow,
                CreatedByIp = ipAddress,
                UserId = userId
            };

            await _tokenRepository.AddAsync(token);
            return token;
        }

        public async Task RevokeTokenAsync(string refreshToken, string ipAddress, string replacedByToken = null)
        {
            var token = await _tokenRepository.GetWhereAsync(t =>
                t.RefreshToken == refreshToken &&
                !t.IsRevoked &&
                DateTime.UtcNow < t.Expires);

            if (token == null || !token.Any())
            {
                throw new ApiException(
                    "TOKEN_NOT_FOUND_OR_INACTIVE",
                    "Токен не найден или уже неактивен",
                    HttpStatusCode.NotFound);
            }

            var activeToken = token.First();
            activeToken.IsRevoked = true;
            activeToken.Revoked = DateTime.UtcNow;
            activeToken.RevokedByIp = ipAddress;
            activeToken.ReplacedByToken = replacedByToken;

            await _tokenRepository.UpdateAsync(activeToken);
        }

        public async Task<Token?> GetActiveTokenAsync(string refreshToken)
        {
            var tokens = await _tokenRepository.GetWhereAsync(t =>
                t.RefreshToken == refreshToken &&
                !t.IsRevoked &&
                DateTime.UtcNow < t.Expires); 

            return tokens.FirstOrDefault();
        }

        public async Task RevokeAllTokensForUserAsync(int userId, string ipAddress)
        {
            var activeTokens = await _tokenRepository.GetWhereAsync(t =>
                t.UserId == userId &&
                !t.IsRevoked &&
                DateTime.UtcNow < t.Expires);

            foreach (var token in activeTokens)
            {
                token.IsRevoked = true;
                token.Revoked = DateTime.UtcNow;
                token.RevokedByIp = ipAddress;
                await _tokenRepository.UpdateAsync(token);
            }
        }

        private static string GenerateRandomToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        }
    }
}