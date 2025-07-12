using Fitness.Core.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Infrastructure.Identity
{
    public class AppUser : IdentityUser<int>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public UserRole Role { get; set; }

        public virtual ICollection<Token> RefreshTokens { get; set; } = new List<Token>();

        public User ToUser() => new User
        {
            UserId = this.Id,
            Email = this.Email,
            FirstName = this.FirstName,
            LastName = this.LastName,
            Role = this.Role
        };

        public static AppUser FromAppUser(User user) => new AppUser
        {
            Id = user.UserId,
            Email = user.Email,
            UserName = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
        };
    }
}
