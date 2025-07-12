using System.Text.Json.Serialization;

namespace Fitness.API.DTOs.Template
{
    public class TemplateDto
    {
        [JsonPropertyName("TemplateId")]
        public int TemplateId { get; set; }
        [JsonPropertyName("TrainerId")]
        public int TrainerId { get; set; }
        [JsonPropertyName("Title")]
        public string Title { get; set; }
        [JsonPropertyName("Description")]
        public string Description { get; set; }
        [JsonPropertyName("Duration")]
        public int Duration { get; set; }
        [JsonPropertyName("MaxParticipants")]
        public int MaxParticipants { get; set; }
    }
}
