using Fitness.Core.Entities;
using Fitness.Core.Exceptions;
using Fitness.Core.Interfaces;
using Fitness.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<AppUser> _userManager;

        public UserService(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<int> CreateUserAsync(User user, string password)
        {
            var appUser = new AppUser
            {
                UserName = user.Email,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
            };

            var result = await _userManager.CreateAsync(appUser, password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                throw new ApiException("USER_CREATION_FAILED",
                    $"Ошибка создания пользователя: {string.Join(", ", errors)}",
                    HttpStatusCode.BadRequest);
            }

            return appUser.Id;
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            var appUser = await _userManager.FindByIdAsync(id.ToString());
            return appUser?.ToUser();
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            try
            {
                var users = await _userManager.Users
                    .Select(u => new User
                    {
                        UserId = u.Id,
                        Email = u.Email,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Role = u.Role
                    })
                    .ToListAsync();

                return users;
            }
            catch (Exception ex)
            {
                throw new ApiException("GET_ALL_USERS_FAILED",
                    $"Ошибка при получении списка пользователей: {ex.Message}",
                    HttpStatusCode.InternalServerError);
            }
        }

        public async Task UpdateUserAsync(User user)
        {
            var appUser = await _userManager.FindByIdAsync(user.UserId.ToString());
            if (appUser == null)
                throw new ApiException("USER_NOT_FOUND", "Пользователь не найден", HttpStatusCode.NotFound);

            appUser.Email = user.Email;
            appUser.FirstName = user.FirstName;
            appUser.LastName = user.LastName;

            var updateResult = await _userManager.UpdateAsync(appUser);
            if (!updateResult.Succeeded)
                throw new ApiException("USER_UPDATE_FAILED",
                    $"Ошибка обновления: {string.Join(", ", updateResult.Errors.Select(e => e.Description))}",
                    HttpStatusCode.BadRequest);
        }

        public async Task DeleteUserAsync(int userId)
        {
            var appUser = await _userManager.FindByIdAsync(userId.ToString());
            if (appUser == null)
                throw new ApiException("USER_NOT_FOUND", "Пользователь не найден", HttpStatusCode.NotFound);

            var result = await _userManager.DeleteAsync(appUser);
            if (!result.Succeeded)
                throw new ApiException("USER_DELETE_FAILED",
                    $"Ошибка удаления: {string.Join(", ", result.Errors.Select(e => e.Description))}",
                    HttpStatusCode.BadRequest);
        }

        public async Task<Dictionary<int, User>> GetUsersByIdsAsync(IEnumerable<int> userIds)
        {
            var users = await _userManager.Users
                .Where(u => userIds.Contains(u.Id))
                .ToListAsync();

            return users.ToDictionary(u => u.Id, u => u.ToUser());
        }

        public async Task<bool> CheckPasswordAsync(int userId, string password)
        {
            var appUser = await _userManager.FindByIdAsync(userId.ToString());
            if (appUser == null)
                return false;

            return await _userManager.CheckPasswordAsync(appUser, password);
        }

        public async Task ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            var appUser = await _userManager.FindByIdAsync(userId.ToString());
            if (appUser == null)
                throw new ApiException("USER_NOT_FOUND", "Пользователь не найден", HttpStatusCode.NotFound);

            var result = await _userManager.ChangePasswordAsync(appUser, currentPassword, newPassword);
            if (!result.Succeeded)
                throw new ApiException("PASSWORD_CHANGE_FAILED",
                    $"Ошибка смены пароля: {string.Join(", ", result.Errors.Select(e => e.Description))}",
                    HttpStatusCode.BadRequest);
        }

    }
}
