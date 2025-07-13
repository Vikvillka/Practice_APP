using Fitness.Core.Entities;
using Fitness.Core.Exceptions;
using Fitness.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Core.Services
{
    public class OrderService : IOrderService
    {
        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<Training> _trainingRepository;
        private readonly IUserService _userService;
        private readonly IRepository<Template> _templateRepository;
        private readonly ITrainingService _trainingService;

        public OrderService(
            IRepository<Order> orderRepository,
            IRepository<Training> trainingRepository,
            IUserService userService,
            IRepository<Template> templateRepository)
        {
            _orderRepository = orderRepository;
            _trainingRepository = trainingRepository;
            _userService = userService;
            _templateRepository = templateRepository;
        }

        public async Task<IEnumerable<Order>> GetAll()
        {
            var orders = await _orderRepository.GetAllAsync();
            var trainingIds = orders.Select(o => o.TrainingId).Distinct().ToList();
            var userIds = orders.Select(o => o.UserId).Distinct().ToList();

            var trainings = await _trainingRepository.GetWhereAsync(t => trainingIds.Contains(t.TrainingId));
            var templateIds = trainings.Select(t => t.TemplateId).Distinct().ToList();
            var templates = await _templateRepository.GetWhereAsync(t => templateIds.Contains(t.TemplateId));

            var usersDict = await _userService.GetUsersByIdsAsync(userIds);

            return orders.Select(o => 
            {
                var training = trainings.FirstOrDefault(t => t.TrainingId == o.TrainingId);
                if (training != null)
                {
                    training.Template = templates.FirstOrDefault(t => t.TemplateId == training.TemplateId);
                }
                return new Order
                {
                    OrderId = o.OrderId,
                    Status = o.Status,
                    Training = training,
                    User = usersDict.TryGetValue(o.UserId, out var user) ? user : null
                };
            })
            .OrderBy(o => o.Training?.DateTime)
            .ToList();
        }

        public async Task<IEnumerable<Order>> GetAllForUser(int userId)
        {
            if (userId <= 0)
            {
                throw new ApiException("INVALID_USER_ID", "Не указан ID пользователя", HttpStatusCode.BadRequest);
            }

            var orders = await _orderRepository.GetWhereAsync(o => o.UserId == userId);
            var trainingIds = orders.Select(o => o.TrainingId).Distinct().ToList();

            var trainings = await _trainingRepository.GetWhereAsync(t => trainingIds.Contains(t.TrainingId));
            var templateIds = trainings.Select(t => t.TemplateId).Distinct().ToList();
            var templates = await _templateRepository.GetWhereAsync(t => templateIds.Contains(t.TemplateId));

            var user = await _userService.GetUserByIdAsync(userId);

            return orders.Select(o => 
            {
                var training = trainings.FirstOrDefault(t => t.TrainingId == o.TrainingId);
                if (training != null)
                {
                    training.Template = templates.FirstOrDefault(t => t.TemplateId == training.TemplateId);
                }
                return new Order
                {
                    OrderId = o.OrderId,
                    Status = o.Status,
                    Training = training,
                    User = user
                };
            })
            .OrderBy(o => o.Training?.DateTime)
            .ToList();
        }

        public async Task<IEnumerable<Order>> GetAllForTraining(int trainingId)
        {
            if (trainingId <= 0)
            {
                throw new ApiException("INVALID_TRAINING_ID", "Не указан ID тренировки", HttpStatusCode.BadRequest);
            }

            var orders = await _orderRepository.GetWhereAsync(o => o.TrainingId == trainingId);
            var userIds = orders.Select(o => o.UserId).Distinct().ToList();

            var training = await _trainingRepository.GetByIdAsync(trainingId);
            if (training != null)
            {
                training.Template = await _templateRepository.GetByIdAsync(training.TemplateId);
            }
            var usersDict = await _userService.GetUsersByIdsAsync(userIds);

            return orders.Select(o => new Order
            {
                OrderId = o.OrderId,
                Status = o.Status,
                Training = training,
                User = usersDict.TryGetValue(o.UserId, out var user) ? user : null
            })
            .OrderBy(o => o.Training?.DateTime)
            .ToList();
        }

        public async Task<Order?> GetById(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null) return null;

            order.Training = await _trainingRepository.GetByIdAsync(order.TrainingId);
            order.User = await _userService.GetUserByIdAsync(order.UserId);

            if (order.Training != null)
            {
                order.Training.Template = await _templateRepository.GetByIdAsync(order.Training.TemplateId);
            }

            return order;
        }

        public async Task Add(Order order)
        {
            var errors = ValidateOrder(order);
            if (errors.Any())
            {
                throw new ValidException(errors);
            }

            await CheckOrderConstraints(order);

            order.Status = OrderStatus.Active;
            await _orderRepository.AddAsync(order);

            await UpdateTrainingParticipants(order.TrainingId, 1);
        }

        public async Task Cancel(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
            {
                throw new ApiException("ORDER_NOT_FOUND", "Запись не найдена", HttpStatusCode.NotFound);
            }

            if (order.Status == OrderStatus.Cancelled)
            {
                throw new ApiException("ORDER_ALREADY_CANCELLED", "Запись уже отменена", HttpStatusCode.BadRequest);
            }

            order.Status = OrderStatus.Cancelled;
            await _orderRepository.UpdateAsync(order);

            await UpdateTrainingParticipants(order.TrainingId, -1);
        }

        private Dictionary<string, string[]> ValidateOrder(Order order)
        {
            var errors = new Dictionary<string, string[]>();

            if (order.TrainingId <= 0)
            {
                errors.Add(nameof(order.TrainingId), ["Не указана тренировка"]);
            }

            if (order.UserId <= 0)
            {
                errors.Add(nameof(order.UserId), ["Не указан пользователь"]);
            }

            return errors;
        }

        private async Task CheckOrderConstraints(Order order)
        {
            var training = await _trainingRepository.GetByIdAsync(order.TrainingId);
            var user = await _userService.GetUserByIdAsync(order.UserId);

            if (training == null)
            {
                throw new ApiException("TRAINING_NOT_FOUND", "Тренировка не найдена", HttpStatusCode.NotFound);
            }

            if (user == null)
            {
                throw new ApiException("USER_NOT_FOUND", "Пользователь не найден", HttpStatusCode.NotFound);
            }

            var template = await _templateRepository.GetByIdAsync(training.TemplateId);
            if (template == null)
            {
                throw new ApiException("TEMPLATE_NOT_FOUND", "Шаблон тренировки не найден", HttpStatusCode.NotFound);
            }

            if (training.CurrentParticipants >= template.MaxParticipants)
            {
                throw new ApiException("NO_AVAILABLE_SLOTS", "Нет доступных мест на тренировку", HttpStatusCode.BadRequest);
            }

            var existingOrder = await _orderRepository.GetWhereAsync(o =>
                o.TrainingId == order.TrainingId &&
                o.UserId == order.UserId &&
                o.Status == OrderStatus.Active);

            if (existingOrder.Any())
            {
                throw new ApiException("DUPLICATE_ORDER", "Вы уже записаны на эту тренировку", HttpStatusCode.BadRequest);
            }

            var userOrders = await _orderRepository.GetWhereAsync(o =>
                o.UserId == order.UserId &&
                o.Status == OrderStatus.Active &&
                o.TrainingId != order.TrainingId);

            if (userOrders.Any())
            {
                var trainings = await _trainingRepository.GetWhereAsync(t =>
                    userOrders.Select(o => o.TrainingId).Contains(t.TrainingId));

                var templates = await _templateRepository.GetWhereAsync(t =>
                    trainings.Select(tr => tr.TemplateId).Contains(t.TemplateId));

                var currentTrainingEnd = training.DateTime.AddMinutes(template.Duration);

                foreach (var userOrder in userOrders)
                {
                    var userTraining = trainings.FirstOrDefault(t => t.TrainingId == userOrder.TrainingId);
                    if (userTraining != null)
                    {
                        var userTemplate = templates.FirstOrDefault(t => t.TemplateId == userTraining.TemplateId);
                        if (userTemplate != null)
                        {
                            var userTrainingEnd = userTraining.DateTime.AddMinutes(userTemplate.Duration);

                            if (training.DateTime < userTrainingEnd && currentTrainingEnd > userTraining.DateTime)
                            {
                                throw new ApiException("TIME_CONFLICT",
                                    $"У вас уже есть запись на тренировку в это время ({userTraining.DateTime} - {userTrainingEnd})",
                                    HttpStatusCode.BadRequest);
                            }
                        }
                    }
                }
            }
        }

        private async Task UpdateTrainingParticipants(int trainingId, int change)
        {
            var training = await _trainingRepository.GetByIdAsync(trainingId);
            if (training != null)
            {
                training.CurrentParticipants += change;
                await _trainingRepository.UpdateAsync(training);
            }
        }
    }
}
