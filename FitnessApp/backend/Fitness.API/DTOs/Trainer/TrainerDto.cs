using Fitness.API.DTOs.Auth;
using Fitness.API.DTOs.Center;
using Fitness.Core.Entities;
using System.Text.Json.Serialization;

namespace Fitness.API.DTOs.Trainer
{
    public class TrainerDto
    {
        [JsonPropertyName("TrainerId")]
        public int TrainerId { get; set; }

        [JsonPropertyName("UserId")]
        public int UserId { get; set; }

        [JsonPropertyName("Email")]
        public string Email { get; set; }

        [JsonPropertyName("FirstName")]
        public string FirstName { get; set; }

        [JsonPropertyName("LastName")]
        public string LastName { get; set; }

        [JsonPropertyName("Description")]
        public string Description { get; set; }

        [JsonPropertyName("Specialization")]
        public string Specialization { get; set; }

        [JsonPropertyName("ExperienceYears")]
        public int ExperienceYears { get; set; }

        [JsonPropertyName("Img")]
        public string ImgUrl { get; set; }

        [JsonPropertyName("CenterId")]
        public int CenterId { get; set; }

        [JsonPropertyName("Center")]
        public CenterDto Center { get; set; }

        [JsonPropertyName("User")]
        public UserDto User { get; set; }
    }
}
