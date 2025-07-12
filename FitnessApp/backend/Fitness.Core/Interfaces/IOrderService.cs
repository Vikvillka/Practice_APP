using Fitness.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Interfaces
{
    public interface IOrderService
    {
        Task<IEnumerable<Order>> GetAll();
        Task<IEnumerable<Order>> GetAllForUser(int userId);
        Task<IEnumerable<Order>> GetAllForTraining(int trainingId);
        Task<Order?> GetById(int id);
        Task Add(Order order);
        Task Cancel(int id);
    }
}
