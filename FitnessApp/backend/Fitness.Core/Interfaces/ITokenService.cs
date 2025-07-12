using Fitness.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Interfaces
{
    public interface ITokenService
    {
        Task<Token> GenerateRefreshTokenAsync(int userId, string ipAddress);
        Task RevokeTokenAsync(string refreshToken, string ipAddress, string replacedByToken = null);
        Task<Token?> GetActiveTokenAsync(string refreshToken);
        Task RevokeAllTokensForUserAsync(int userId, string ipAddress);
    }
}
