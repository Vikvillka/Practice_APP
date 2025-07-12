using System.ComponentModel.DataAnnotations;

namespace Fitness.API.DTOs.Auth
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "Почта обязательна")]
        [EmailAddress(ErrorMessage = "Неверный формат почты")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Пароль обязателен")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
