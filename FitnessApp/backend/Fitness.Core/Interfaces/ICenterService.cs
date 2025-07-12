using Fitness.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Interfaces
{
    public interface ICenterService
    {
        Task<IEnumerable<Center>> GetAll();
        Task<Center?> GetById(int id);
        Task Add(Center center);
        Task Update(Center center);
        Task Delete(int id);
    }
}
