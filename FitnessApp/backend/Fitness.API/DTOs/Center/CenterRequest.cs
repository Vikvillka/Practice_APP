using System.Text.Json.Serialization;

namespace Fitness.API.DTOs.Center
{
    public class CenterRequest
    {
        [JsonPropertyName("CenterName")]
        public string CenterName { get; set; } = null!;
        [JsonPropertyName("City")]
        public string City { get; set; } = null!;
        [JsonPropertyName("Address")]
        public string Address { get; set; } = null!;
        [JsonPropertyName("Phone")]
        public string Phone { get; set; } = null!;
        [JsonPropertyName("Latitude")]
        public double? Latitude { get; set; }
        [JsonPropertyName("Longitude")]
        public double? Longitude { get; set; }
    }
}
