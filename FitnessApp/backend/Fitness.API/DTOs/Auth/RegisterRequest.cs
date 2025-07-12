using Fitness.Core.Entities;
using System.ComponentModel.DataAnnotations;

namespace Fitness.API.DTOs.Auth
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Почта обязательна")]
        [EmailAddress(ErrorMessage = "Неверный формат почты")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Имя обязательно")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Имя должно содержать от 2 до 25 символов")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Фамилия обязательна")]
        [StringLength(50, MinimumLength = 6, ErrorMessage = "Фамилия должна содержать от 6 до 25 символов")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Пароль обязателен")]
        [DataType(DataType.Password)]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Пароль должен состоять минимум из 8 символов")]
        public string Password { get; set; }

        public User ToUser() => new User
        {
            Email = this.Email,
            FirstName = this.FirstName,
            LastName = this.LastName,
            Role = UserRole.Client 
        };
    }
}
