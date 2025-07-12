using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Exceptions
{
    public class ValidException : ApiException
    {
        public Dictionary<string, string[]> Errors { get; }

        public ValidException(Dictionary<string, string[]> errors): base ("VALIDATION_ERROR", "Ошибка валидации") 
        {
            Errors = errors;
        }
    }
}
