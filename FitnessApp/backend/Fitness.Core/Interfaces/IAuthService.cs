using System;
using Fitness.Core.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Interfaces
{
    public interface IAuthService
    {
        Task<(string accessToken, string refreshToken, User User)> RegisterAsync(User user, string password, string ipAddress);
        Task<(string accessToken, string refreshToken, User User)> LoginAsync(string email, string password, string ipAddress);
        Task<(string newAccessToken, string newRefreshToken, User User)> RefreshTokenAsync(string accessToken, string refreshToken, string ipAddress);
        Task LogoutAsync(string refreshToken, string ipAddress);
    }
}
