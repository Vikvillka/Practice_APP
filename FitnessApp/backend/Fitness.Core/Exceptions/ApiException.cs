using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Exceptions
{
    public class ApiException : Exception
    {
        public string ErrorCode {  get; }
        public HttpStatusCode StatusCode { get; }

        public ApiException(string errorCode, string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest) : base(message)
        {
            ErrorCode = errorCode;
            StatusCode = statusCode;
        }
    }
}
