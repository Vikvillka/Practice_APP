using Fitness.API.DTOs.Template;
using Fitness.API.DTOs.Trainer;
using System.Text.Json.Serialization;

namespace Fitness.API.DTOs.Training
{
    public class TrainingDto
    {
        [JsonPropertyName("TrainingId")]
        public int TrainingId { get; set; }
        [JsonPropertyName("DateTime")]
        public DateTime DateTime { get; set; }
        [JsonPropertyName("Price")]
        public decimal Price { get; set; }
        [JsonPropertyName("Status")]
        public string Status { get; set; }
        [JsonPropertyName("TemplateId")]
        public int TemplateId { get; set; }
        [JsonPropertyName("TrainerId")]
        public int TrainerId { get; set; }
        [JsonPropertyName("CenterId")]
        public int CenterId { get; set; }
        [JsonPropertyName("CurrentParticipants")]
        public int CurrentParticipants { get; set; }
        [JsonPropertyName("Template")]
        public TemplateDto Template { get; set; }
        [JsonPropertyName("Trainer")]
        public TrainerDto Trainer { get; set; }
    }
}
