using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Entities
{
    public class Trainer
    {
        public int TrainerId { get; set; }
        public int UserId { get; set; }
        public int CenterId { get; set; }
        public string? Img { get; set; }
        public string Description { get; set; }
        public string Specialization { get; set; }
        public int ExperienceYears { get; set; }
        [NotMapped]
        public User? User { get; set; }
        public Center Center { get; set; }
        public ICollection<Template> Templates { get; set; } = new List<Template>();
        public ICollection<Training> Trainings { get; set; } = new List<Training>();
    }
}
