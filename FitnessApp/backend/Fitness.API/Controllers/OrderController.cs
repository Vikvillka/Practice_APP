using Fitness.API.DTOs.Order;
using Fitness.API.DTOs.Template;
using Fitness.API.DTOs.Training;
using Fitness.Core.Entities;
using Fitness.Core.Exceptions;
using Fitness.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fitness.API.Controllers
{
    [ApiController]
    [Route("api/order")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogger<OrderController> _logger;

        public OrderController(
           IOrderService orderService,
           ILogger<OrderController> logger)
        {
            _orderService = orderService;
            _logger = logger;
        }

        [HttpGet]
        //[Authorize(Policy = "Admin")]
        public async Task<IActionResult> GetOrders()
        {
            try
            {
                var orders = await _orderService.GetAll();
                return Ok(orders.Select(o => new OrderDto
                {
                    OrderId = o.OrderId,
                    TrainingId = o.Training.TrainingId,
                    UserId = o.User.UserId,
                    Status = o.Status.ToString(),
                    Training = o.Training != null ? new TrainingDto
                    {
                        TrainerId = o.TrainingId,
                        Status = o.Training.Status.ToString(),
                        DateTime = o.Training.DateTime,
                        Price = o.Training.Price,
                        CurrentParticipants = o.Training.CurrentParticipants,
                        Template = o.Training.Template != null ? new TemplateDto
                        {
                            TemplateId = o.Training.Template.TemplateId,
                            Title = o.Training.Template.Title,
                            Description = o.Training.Template.Description,
                            Duration = o.Training.Template.Duration,
                            MaxParticipants = o.Training.Template.MaxParticipants,
                        } : null
                    } : null,
                    User = o.User
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка бронирований");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpGet("{orderId}")]
        //[Authorize]
        public async Task<IActionResult> GetOrderById(int orderId)
        {
            try
            {
                var order = await _orderService.GetById(orderId);
                if (order == null)
                {
                    return NotFound(new { Message = "Бронирование не найдено" });
                }

                return Ok(new OrderDto
                {
                    OrderId = order.OrderId,
                    TrainingId = order.Training.TrainingId,
                    UserId = order.User.UserId,
                    Status = order.Status.ToString(),
                    Training = order.Training != null ? new TrainingDto
                    {
                        TrainerId = order.TrainingId,
                        Status = order.Training.Status.ToString(),
                        DateTime = order.Training.DateTime,
                        Price = order.Training.Price,
                        CurrentParticipants = order.Training.CurrentParticipants,
                        Template = order.Training.Template != null ? new TemplateDto
                        {
                            TemplateId = order.Training.Template.TemplateId,
                            Title = order.Training.Template.Title,
                            Description = order.Training.Template.Description,
                            Duration = order.Training.Template.Duration,
                            MaxParticipants = order.Training.Template.MaxParticipants,
                        } : null
                    } : null,
                    User = order.User
                });
            }
            catch (ApiException ex)
            {
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении бронирования с ID {orderId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpPost]
        //[Authorize]
        public async Task<IActionResult> CreateOrder([FromBody] OrderRequest dto)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var order = new Order
                {
                    TrainingId = dto.TrainingId,
                    UserId = dto.UserId
                };

                await _orderService.Add(order);

                return Ok(new OrderDto
                {
                    OrderId = order.OrderId,
                    TrainingId = order.TrainingId,
                    Status = order.Status.ToString(),
                    User = order.User
                });
            }
            catch (ValidException ex)
            {
                return BadRequest(new { Errors = ex.Errors });
            }
            catch (ApiException ex)
            {
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании бронирования");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpGet("{userId}/orders")]
        //[Authorize]
        public async Task<IActionResult> GetOrdersForUserById(int userId)
        {
            try
            {
                var orders = await _orderService.GetAllForUser(userId);
                return Ok(orders.Select(o => new OrderDto
                {
                    OrderId = o.OrderId,
                    TrainingId = o.Training.TrainingId,
                    UserId = o.User.UserId,
                    Status = o.Status.ToString(),
                    Training = o.Training != null ? new TrainingDto
                    {
                        TrainerId = o.TrainingId,
                        Status = o.Training.Status.ToString(),
                        DateTime = o.Training.DateTime,
                        Price = o.Training.Price,
                        CurrentParticipants = o.Training.CurrentParticipants,
                        Template = o.Training.Template != null ? new TemplateDto
                        {
                            TemplateId = o.Training.Template.TemplateId,
                            Title = o.Training.Template.Title,
                            Description = o.Training.Template.Description,
                            Duration = o.Training.Template.Duration,
                            MaxParticipants = o.Training.Template.MaxParticipants,
                        } : null
                        } : null,
                    User = o.User
                }));
            }
            catch (ApiException ex)
            {
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении бронирований для пользователя с ID {userId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpGet("{trainingId}/trainingorders")]
        //[Authorize(Policy = "Trainer")]
        public async Task<IActionResult> GetOrdersForTrainingById(int trainingId)
        {
            try
            {
                var orders = await _orderService.GetAllForTraining(trainingId);
                return Ok(orders.Select(o => new OrderDto
                {
                    OrderId = o.OrderId,
                    Status = o.Status.ToString(),
                    Training = o.Training != null ? new TrainingDto
                    {
                        TrainerId = o.TrainingId,
                        Status = o.Training.Status.ToString(),
                    } : null,
                    User = o.User
                }));
            }
            catch (ApiException ex)
            {
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении бронирований для тренировки с ID {trainingId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpPut("{orderId}/cancel")]
        //[Authorize]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            try
            {
                await _orderService.Cancel(orderId);
                return Ok();
            }
            catch (ApiException ex)
            {
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при отмене бронирования с ID {orderId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }
    }
}
