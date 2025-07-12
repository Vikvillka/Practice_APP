using System;
using Fitness.Core.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Interfaces
{
    public interface ITrainingService
    {
        Task<IEnumerable<Training>> GetAll();
        Task<Training?> GetById(int id);
        Task<IEnumerable<Training>> GetByIdTrainer(int id);
        Task Add(Training training);
        Task Cancel(int id);
    }
}
