using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Entities
{
    public class Order
    {
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public int TrainingId { get; set; }
        public OrderStatus Status { get; set; }

        [NotMapped] 
        public User? User { get; set; } 
        public Training Training { get; set; }
    }

    public enum OrderStatus
    {
        Active,
        Cancelled
    }
}
