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
    public class TemplateService : ITemplateService
    {
        private readonly IRepository<Template> _templateRepository;
        private readonly IRepository<Trainer> _trainerRepository;
        private readonly IRepository<Training> _trainingRepository;
        private readonly IUserService _userService;

        public TemplateService(
           IRepository<Template> templateRepository,
           IRepository<Trainer> trainerRepository,
           IRepository<Training> trainingRepository,
           IUserService userService)
        {
            _templateRepository = templateRepository;
            _trainerRepository = trainerRepository;
            _trainingRepository = trainingRepository;
            _userService = userService;
        }

        public async Task<IEnumerable<Template>> GetAll()
        {
            var templates = await _templateRepository.GetAllAsync();

            var trainerIds = templates.Where(t => t.TrainerId != 0)
                .Select(t => t.TrainerId).ToList();

            var trainers = await _trainerRepository.GetWhereAsync(t => trainerIds.Contains(t.TrainerId));

            var trainersDict = trainers.ToDictionary(t => t.TrainerId, t => t);

            var userIds = trainers.Select(t => t.UserId).Distinct().ToList();

            var usersDict = await _userService.GetUsersByIdsAsync(userIds);

            foreach (var template in templates)
            {
                if (template.TrainerId != 0)
                {
                    var trainer = trainers.FirstOrDefault(t => t.TrainerId == template.TrainerId);
                    if (trainer != null && usersDict.TryGetValue(trainer.UserId, out var user))
                    {
                        template.Trainer = trainer;
                        template.Trainer.User = user;
                    }
                }
            }

            return templates;
        }

        public async Task<Template?> GetById(int id)
        {
            var template = await _templateRepository.GetByIdAsync(id);
            if (template == null)
            {
                throw new ApiException(
                    "TEMPLATE_NOT_FOUND",
                    "Шаблон не найден",
                    HttpStatusCode.NotFound);
            }
            return template;
        }

        public async Task<IEnumerable<Template>> GetByIdTrainer(int id)
        {

            var trainer = (await _trainerRepository.GetWhereAsync(t => t.UserId == id))
            .FirstOrDefault();

            if (trainer == null)
            {
                throw new ApiException(
                    "TRAINER_NOT_FOUND",
                    "Тренер не найден",
                    HttpStatusCode.NotFound);
            }

            return await _templateRepository.GetWhereAsync(t => t.TrainerId == trainer.TrainerId);
        }
        
        public async Task Add(Template template)
        {
            var errors = ValidateTemplate(template);
            if (errors.Any())
                throw new ValidException(errors);

            var trainer = await _trainerRepository.GetByIdAsync(template.TrainerId);
            if (trainer == null)
            {
                throw new ApiException(
                    "TRAINER_NOT_FOUND",
                    "Тренер не найден",
                    HttpStatusCode.BadRequest);
            }

            if (trainer.CenterId == null)
            {
                throw new ApiException(
                    "TRAINER_NO_CENTER",
                    "Тренер не привязан к центру",
                    HttpStatusCode.BadRequest);
            }

            if (await _templateRepository.ExistsAsync(t =>
                t.TrainerId == template.TrainerId &&
                t.Title.ToLower() == template.Title.ToLower()))
            {
                throw new ApiException(
                    "TEMPLATE_EXISTS",
                    "Шаблон с таким названием уже существует у этого тренера",
                    HttpStatusCode.Conflict);
            }

            await _templateRepository.AddAsync(template);
        }

        public async Task DeleteById(int id)
        {
            var template = await _templateRepository.GetByIdAsync(id);
            if (template == null)
            {
                throw new ApiException(
                    "TEMPLATE_NOT_FOUND",
                    "Шаблон не найден",
                    HttpStatusCode.NotFound);
            }

            bool hasActiveTrainings = await _trainingRepository.ExistsAsync(t =>
                t.TemplateId == id &&
                t.Status == TrainingStatus.Active);

            if (hasActiveTrainings)
            {
                throw new ApiException(
                    "TEMPLATE_IN_USE",
                    "Невозможно удалить шаблон, так как он используется в активных тренировках",
                    HttpStatusCode.BadRequest);
            }

            await _templateRepository.DeleteAsync(template);
        }

        private Dictionary<string, string[]> ValidateTemplate(Template template)
        {
            var errors = new Dictionary<string, string[]>();

            if (string.IsNullOrWhiteSpace(template.Title))
                errors.Add(nameof(template.Title), ["Название шаблона обязательно"]);

            if (string.IsNullOrWhiteSpace(template.Description))
                errors.Add(nameof(template.Description), ["Описание обязательно"]);

            if (template.Duration <= 0)
                errors.Add(nameof(template.Duration), ["Длительность должна быть положительной"]);

            if (template.MaxParticipants <= 0)
                errors.Add(nameof(template.MaxParticipants), ["Количество участников должно быть положительным"]);

            if (template.TrainerId <= 0)
                errors.Add(nameof(template.TrainerId), ["Не указан тренер"]);

            return errors;
        }
    }
}
