using System.ComponentModel.DataAnnotations;

namespace Fitness.API.DTOs.Trainer
{
    public class TrainerRequest
    {
        [Required(ErrorMessage = "Email обязателен")]
        [EmailAddress(ErrorMessage = "Некорректный email")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Имя обязательно")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Фамилия обязательна")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Пароль обязателен")]
        [MinLength(6, ErrorMessage = "Пароль должен содержать не менее 6 символов")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Описание обязательно")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Специализация обязательна")]
        public string Specialization { get; set; }

        [Required(ErrorMessage = "Опыт обязателен")]
        [Range(1, 40, ErrorMessage = "Опыт должен быть от 1 до 40 лет")]
        public int ExperienceYears { get; set; }

        [Required(ErrorMessage = "Центр обязателен")]
        public int CenterId { get; set; }

        public IFormFile? Img { get; set; }
    }
}
