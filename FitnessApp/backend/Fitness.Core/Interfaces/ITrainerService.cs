using Fitness.Core.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Interfaces
{
    public interface ITrainerService
    {
        Task<IEnumerable<Trainer>> GetAllAsync();
        Task<Trainer?> GetByIdAsync(int id);
        Task AddAsync(Trainer trainer, string password, IFormFile? imageFile = null);
        Task UpdateAsync(Trainer trainer, IFormFile? imageFile = null);
        Task DeleteAsync(int id);
        Task<Stream?> GetTrainerImageAsync(int id);
    }
}
