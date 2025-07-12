using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Entities
{
    public class Center
    {
        public int CenterId { get; set; }
        public string CenterName { get; set;}
        public string Address { get; set; }
        public string City { get; set; }
        public string Phone { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public ICollection<Trainer> Trainers { get; set; } = new List<Trainer>();
        public ICollection<Training> Trainings { get; set; } = new List<Training>();
    }
}
