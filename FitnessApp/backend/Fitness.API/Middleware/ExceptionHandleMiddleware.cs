using Fitness.Core.Exceptions;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Net;
using System.Text.Json;

namespace Fitness.API.Middleware
{
    public class ExceptionHandleMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandleMiddleware> _logger;

        public ExceptionHandleMiddleware(RequestDelegate next, ILogger<ExceptionHandleMiddleware> logger) 
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            _logger.LogError(exception, "Произошла ошибка: {Message}", exception.Message);

            object response;

            var statusCode = HttpStatusCode.InternalServerError;

            switch (exception)
            {
                case ValidException validationEx:
                    statusCode = HttpStatusCode.UnprocessableEntity;
                    response = new
                    {
                        errorCode = "VALIDATION_ERROR",
                        message = "Ошибка валидации данных",
                        details = (string?)null,
                        errors = validationEx.Errors 
                    };
                    break;

                case ApiException apiException:
                    statusCode = apiException.StatusCode;
                    response = new
                    {
                        errorCode = apiException.ErrorCode,
                        message = apiException.Message,
                        details = context.Response.StatusCode == 500 ? exception.StackTrace : null,
                        errors = (object?)null
                    };
                    break;
                default:
                    response = new
                    {
                        errorCode = "UNKNOWN_ERROR",
                        message = "Внутренняя ошибка сервера",
                        details = (int)statusCode >= 500 ? exception.StackTrace : null,
                        errors = (object?)null
                    };
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
