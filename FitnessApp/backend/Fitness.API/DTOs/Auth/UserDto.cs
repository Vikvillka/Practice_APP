using Fitness.Core.Entities;
using System.Text.Json.Serialization;

namespace Fitness.API.DTOs.Auth
{
    public class UserDto
    {
        [JsonPropertyName("UserId")]
        public int UserId { get; set; }
        [JsonPropertyName("Email")]
        public string Email { get; set; } = null!;
        [JsonPropertyName("FirstName")]
        public string FirstName { get; set; } = null!;
        [JsonPropertyName("LastName")]
        public string LastName { get; set; } = null!;
        [JsonPropertyName("Role")]
        public UserRole Role { get; set; }
    }
}
