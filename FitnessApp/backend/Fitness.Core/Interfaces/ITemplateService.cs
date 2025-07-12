using Fitness.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Interfaces
{
    public interface ITemplateService
    {
        Task<IEnumerable<Template>> GetAll();
        Task<Template?> GetById(int id);
        Task<IEnumerable<Template>> GetByIdTrainer(int id);
        Task Add(Template template);
        Task DeleteById(int id);
    }
}
