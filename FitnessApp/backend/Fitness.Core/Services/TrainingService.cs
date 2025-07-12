using Fitness.Core.Entities;
using Fitness.Core.Exceptions;
using Fitness.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Fitness.Core.Services
{
    public class TrainingService : ITrainingService
    {
        private readonly IRepository<Training> _trainingRepository;
        private readonly IRepository<Template> _templateRepository;
        private readonly IRepository<Trainer> _trainerRepository;
        private readonly IRepository<Center> _centerRepository;

        public TrainingService(
            IRepository<Training> trainingRepository,
            IRepository<Template> templateRepository,
            IRepository<Trainer> trainerRepository,
            IRepository<Center> centerRepository,
            IRepository<Order> orderRepository)
        {
            _trainingRepository = trainingRepository;
            _templateRepository = templateRepository;
            _trainerRepository = trainerRepository;
            _centerRepository = centerRepository;
        }

        public async Task<IEnumerable<Training>> GetAll()
        {
            await CheckAndCloseExpiredTrainings();
            var trainings = await _trainingRepository.GetWhereAsync(t => t.Status != TrainingStatus.Cancelled);
            var templateIds = trainings.Select(t => t.TemplateId).Distinct().ToList();
            var trainerIds = trainings.Select(t => t.TrainerId).Distinct().ToList();

            var templates = await _templateRepository.GetWhereAsync(t => templateIds.Contains(t.TemplateId));
            var trainers = await _trainerRepository.GetWhereAsync(t => trainerIds.Contains(t.TrainerId));

            return trainings
                .Select(t => new Training
                {
                    TrainingId = t.TrainingId,
                    DateTime = t.DateTime,
                    Status = t.Status,
                    Price = t.Price,
                    Template = templates.FirstOrDefault(temp => temp.TemplateId == t.TemplateId),
                    Trainer = trainers.FirstOrDefault(tr => tr.TrainerId == t.TrainerId),
                })
                .OrderBy(t => t.DateTime)
                .ToList();
        }

        public async Task<Training?> GetById(int id)
        {
            var training = await _trainingRepository.GetByIdAsync(id);

            if (training == null)
            {
                throw new ApiException(
                        "TRAINING_NOT_FOUND",
                        "Тренеровка не найдена",
                        HttpStatusCode.NotFound);
            }
            training.Template = await _templateRepository.GetByIdAsync(training.TemplateId);
            training.Trainer = await _trainerRepository.GetByIdAsync(training.TrainerId);

            return training;
        }

        public async Task<IEnumerable<Training>> GetByIdTrainer(int id)
        {
            await CheckAndCloseExpiredTrainings();
            var trainer = await _trainerRepository.GetByIdAsync(id);
            if (trainer == null)
            {
                throw new ApiException(
                        "TRAINER_NOT_FOUND",
                        "Тренер не найден",
                        HttpStatusCode.NotFound);
            }
            var trainings = await _trainingRepository.GetWhereAsync(t =>
               t.TrainerId == id && t.Status != TrainingStatus.Cancelled);

            var templateIds = trainings.Select(t => t.TemplateId).Distinct();

            var templates = await _templateRepository.GetWhereAsync(t => templateIds.Contains(t.TemplateId));

            return trainings.Select(t => new Training
            {
                TrainingId = t.TrainingId,
                DateTime = t.DateTime,
                Status = t.Status,
                Price = t.Price,
                Template = templates.FirstOrDefault(temp => temp.TemplateId == t.TemplateId),
                Trainer = trainer
            })
           .OrderBy(t => t.DateTime)
           .ToList();
        }

        public async Task Add(Training training)
        {
            ValidateTraining(training);
            await CheckTrainingConflicts(training);

            training.Status = TrainingStatus.Active;
            await _trainingRepository.AddAsync(training);
        }

        public async Task Cancel(int id)
        {
            var training = await _trainingRepository.GetByIdAsync(id);
            if (training == null)
            {
                throw new ApiException(
                   "TRAINING_NOT_FOUND",
                   "Тренеровка не найдена",
                    HttpStatusCode.NotFound);
            }

            if (training.DateTime < DateTime.UtcNow)
            {
                throw new ApiException(
                    "TRAINING_PASSED",
                    "Нельзя отменить уже прошедшую тренировку",
                    HttpStatusCode.BadRequest);
            }
            if ((training.DateTime - DateTime.UtcNow).TotalHours < 2)
            {
                throw new ApiException(
                   "TRAINING_FIXED",
                   "Нельзя отменить тренировку менее чем за 2 часа до начала",
                   HttpStatusCode.BadRequest);
            }

            training.Status = TrainingStatus.Cancelled;
            await _trainingRepository.UpdateAsync(training);
        }

        // вынести в расписание
        private async Task CheckAndCloseExpiredTrainings()
        {
            var now = DateTime.UtcNow;
            var expiredTrainings = await _trainingRepository.GetWhereAsync(t => t.DateTime < now && t.Status == TrainingStatus.Active);

            foreach (var training in expiredTrainings)
            {
                training.Status = TrainingStatus.Closed;
                await _trainingRepository.UpdateAsync(training);
            }
        }

        private void ValidateTraining(Training training)
        {
            if (training.DateTime < DateTime.UtcNow.AddHours(12))
            {
                throw new ApiException(
                  "TRAINING_FIXED",
                  "Тренировку можно назначить минимум за 12 часов до начала",
                  HttpStatusCode.BadRequest);
            }

            if (training.DateTime > DateTime.UtcNow.AddMonths(1))
            {
                throw new ApiException(
                  "TRAINING_FIXED",
                  "Нельзя создавать тренировки позднее чем на месяц вперед",
                  HttpStatusCode.BadRequest);
            }

            var startHour = training.DateTime.Hour;
            var endHour = training.DateTime.AddMinutes(training.Template.Duration).Hour;

            if (startHour < 8 || endHour > 21)
            {
                throw new ApiException(
                  "TRAINING_FIXED",
                  "Тренировка должна проходить в интервале с 8:00 до 21:00",
                  HttpStatusCode.BadRequest);
            }
        }

        private async Task CheckTrainingConflicts(Training training, bool isUpdate = false)
        {
            var errors = new Dictionary<string, string[]>();
            if (training.TemplateId <= 0)
                errors.Add(nameof(training.TemplateId), ["Шаблон не указан"]);
            if (training.TrainerId <= 0)
                errors.Add(nameof(training.TrainerId), ["Тренер не указан"]);
            if (training.CenterId <= 0)
                errors.Add(nameof(training.CenterId), ["Центр не указан"]);

            if (errors.Any())
                throw new ValidException(errors);

            var template = await _templateRepository.GetByIdAsync(training.TemplateId);
            var trainer = await _trainerRepository.GetByIdAsync(training.TrainerId);
            var center = await _centerRepository.GetByIdAsync(training.CenterId);

            if (template == null || trainer == null || center == null)
            {
                errors = new Dictionary<string, string[]>();
                if (template == null) errors.Add(nameof(training.TemplateId), ["Шаблон не найден"]);
                if (trainer == null) errors.Add(nameof(training.TrainerId), ["Тренер не найден"]);
                if (center == null) errors.Add(nameof(training.CenterId), ["Центр не найден"]);
                
                throw new ValidException(errors);
            }
            
            var startTime = training.DateTime;
            var endTime = startTime.AddMinutes(template.Duration);

            var trainerTrainings = await _trainingRepository.GetWhereAsync(t =>
               t.TrainerId == training.TrainerId &&
               t.Status != TrainingStatus.Cancelled &&
               (isUpdate ? t.TrainingId != training.TrainingId : true));

            foreach (var t in trainerTrainings)
            {
                var tTemplate = await _templateRepository.GetByIdAsync(t.TemplateId);
                var tStart = t.DateTime;
                var tEnd = tStart.AddMinutes(tTemplate.Duration);

                if (startTime < tEnd && endTime > tStart)
                {
                    throw new ApiException(
                        "TRAINING_СONFLICT",
                        $"Конфликт времени с другой тренировкой тренера: {tStart} - {tEnd}",
                        HttpStatusCode.BadRequest);
                }
            }

            var centerTrainings = await _trainingRepository.GetWhereAsync(t =>
                t.CenterId == training.CenterId &&
                t.TemplateId == training.TemplateId &&
                t.Status != TrainingStatus.Cancelled &&
                (isUpdate ? t.TrainingId != training.TrainingId : true));

            foreach (var t in centerTrainings)
            {
                var tTemplate = await _templateRepository.GetByIdAsync(t.TemplateId);
                var tStart = t.DateTime;
                var tEnd = tStart.AddMinutes(tTemplate.Duration);

                if (startTime < tEnd && endTime > tStart)
                {
                    throw new ApiException(
                        "TRAINING_СONFLICT",
                        $"Конфликт времени с другой тренировкой в этом центре: {tStart} - {tEnd}",
                        HttpStatusCode.BadRequest);
                }
                    
            }
        }
    }
}
