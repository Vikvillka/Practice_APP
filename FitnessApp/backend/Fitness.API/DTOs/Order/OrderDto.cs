using Fitness.API.DTOs.Training;
using Fitness.Core.Entities;
using System.Text.Json.Serialization;

namespace Fitness.API.DTOs.Order
{
    public class OrderDto
    {
        [JsonPropertyName("OrderId")]
        public int OrderId { get; set; }
        [JsonPropertyName("UserId")]
        public int UserId { get; set; }
        [JsonPropertyName("TrainingId")]
        public int TrainingId { get; set; }
        [JsonPropertyName("Status")]
        public string Status { get; set; }
        [JsonPropertyName("Training")]
        public TrainingDto? Training { get; set; }
        [JsonPropertyName("User")]
        public User? User { get; set; }
    }
}
