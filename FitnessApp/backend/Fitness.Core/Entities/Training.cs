using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Entities
{
    public class Training
    {
        public int TrainingId { get; set; }
        public int TrainerId { get; set; }
        public int CenterId { get; set; }
        public int TemplateId { get; set; }
        public TrainingStatus Status { get; set; }
        public DateTime DateTime { get; set; }
        public int CurrentParticipants { get; set; }
        public decimal Price { get; set; }

        public Trainer Trainer { get; set; }
        public Center Center { get; set; }
        public Template Template { get; set; }
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }

    public enum TrainingStatus
    {
        Active,
        Cancelled,
        Closed
    }
}
