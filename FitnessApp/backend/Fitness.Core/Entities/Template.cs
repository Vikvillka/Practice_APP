using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Entities
{
    public class Template
    {
        public int TemplateId { get; set; }
        public int TrainerId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Duration { get; set; } 
        public int MaxParticipants { get; set; }

        public Trainer Trainer { get; set; }
        public ICollection<Training> Trainings { get; set; } = new List<Training>();
    }
}


