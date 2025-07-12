using System.Text.Json.Serialization;

namespace Fitness.API.DTOs.Center
{
    public class CenterRequest
    {
        public string CenterName { get; set; } = null!;
        public string City { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
