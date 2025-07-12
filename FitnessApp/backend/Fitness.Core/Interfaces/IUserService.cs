using Fitness.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Interfaces
{
    public interface IUserService
    {
        Task<int> CreateUserAsync(User user, string password);
        Task<User?> GetUserByIdAsync(int id);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<Dictionary<int, User>> GetUsersByIdsAsync(IEnumerable<int> userIds);
        Task UpdateUserAsync(User user);
        Task DeleteUserAsync(int userId);
        Task<bool> CheckPasswordAsync(int userId, string password);
        Task ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    }
}
