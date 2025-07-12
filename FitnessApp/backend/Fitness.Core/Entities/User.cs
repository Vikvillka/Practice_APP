using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Entities
{
    public class User 
    {
        public int UserId { get; set; }
        //public string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        //public string Phone { get; set; }
        //public int? TelegramCode { get; set; }

        //public string FirstName { get; set; }
        //public string LastName { get; set; }
        //public UserRole Role { get; set; }

        //public Trainer? Trainer { get; set; }
        //public ICollection<Order> Orders { get; set; } = new List<Order>();
    }

    public enum UserRole
    {
        Trainer,
        Client,
        Admin
    }
}
