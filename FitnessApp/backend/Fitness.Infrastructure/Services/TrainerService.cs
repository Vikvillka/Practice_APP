using Fitness.Core.Entities;
using Fitness.Core.Exceptions;
using Fitness.Core.Interfaces;
using Fitness.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Fitness.Infrastructure.Services
{
    public class TrainerService : ITrainerService
    {
        private readonly FitnessContext _context;
        private readonly IUserService _userService;
        private readonly IRepository<Center> _centerRepository;
        private readonly ICloudStorageService _cloudStorage;

        public TrainerService(
            FitnessContext context,
            IUserService userService,
            IRepository<Center> centerRepository,
            ICloudStorageService cloudStorage)
        {
            _context = context;
            _userService = userService;
            _centerRepository = centerRepository;
            _cloudStorage = cloudStorage;
        }

        public async Task<IEnumerable<Trainer>> GetAllAsync()
        {
            var trainers = await _context.Trainers.ToListAsync();
            var userIds = trainers.Select(t => t.UserId).Distinct().ToList();
            var centerIds = trainers.Select(t => t.CenterId).Distinct().ToList();

            var usersDict = await _userService.GetUsersByIdsAsync(userIds);
            var centers = await _centerRepository.GetWhereAsync(c => centerIds.Contains(c.CenterId));

            return trainers.Select(t => new Trainer
            {
                TrainerId = t.TrainerId,
                UserId = t.UserId,
                Description = t.Description,
                Specialization = t.Specialization,
                ExperienceYears = t.ExperienceYears,
                Img = t.Img,
                CenterId = t.CenterId,
                User = usersDict.TryGetValue(t.UserId, out var user) ? user : null,
                Center = centers.FirstOrDefault(c => c.CenterId == t.CenterId),
                Templates = t.Templates,
                Trainings = t.Trainings
            }).ToList();
        }

        public async Task<Trainer?> GetByIdAsync(int id)
        {
            var trainer = await _context.Trainers
                .Include(t => t.Templates)
                .Include(t => t.Trainings)
                .FirstOrDefaultAsync(t => t.UserId == id);

            if (trainer == null)
            {
                throw new ApiException(
                    "TRAINER_NOT_FOUND",
                    "Тренер не найден",
                    HttpStatusCode.NotFound);
            }

            trainer.User = await _userService.GetUserByIdAsync(trainer.UserId);
            trainer.Center = await _centerRepository.GetByIdAsync(trainer.CenterId);

            return trainer;
        }

        public async Task AddAsync(Trainer trainer, string password = null, IFormFile? imageFile = null)
        {
            var errors = ValidateTrainer(trainer);
            if (errors.Any())
                throw new ValidException(errors);

            await CheckTrainerConstraints(trainer);

            string uploadedImageUrl = null;
            try
            {
                if (imageFile != null)
                {
                    if (imageFile.Length > 10 * 1024 * 1024) 
                    {
                        throw new ApiException("FILE_TOO_LARGE", "Размер файла не должен превышать 10MB", HttpStatusCode.BadRequest);
                    }

                    using var memoryStream = new MemoryStream();
                    await imageFile.CopyToAsync(memoryStream);
                    memoryStream.Position = 0;

                    var fileName = $"trainer_{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}";
                    uploadedImageUrl = await _cloudStorage.UploadFileAsync(memoryStream, fileName);
                    trainer.Img = uploadedImageUrl;
                }

                trainer.User!.Role = UserRole.Trainer;
                trainer.UserId = await _userService.CreateUserAsync(trainer.User, password);

                await _context.Trainers.AddAsync(trainer);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                if (!string.IsNullOrEmpty(uploadedImageUrl))
                {
                    try
                    {
                        await _cloudStorage.DeleteFileAsync(uploadedImageUrl);
                    }
                    catch (Exception deleteEx)
                    {
                        throw;
                    }
                }
                throw;
            }
        }

        public async Task UpdateAsync(Trainer trainer, IFormFile? imageFile = null)
        {
            var existingTrainer = await _context.Trainers
                .FirstOrDefaultAsync(t => t.TrainerId == trainer.TrainerId);

            if (existingTrainer == null)
                throw new ApiException("TRAINER_NOT_FOUND", "Тренер не найден", HttpStatusCode.NotFound);

            var errors = ValidateTrainer(trainer, isUpdate: true);
            if (errors.Any())
                throw new ValidException(errors);

            await CheckTrainerConstraints(trainer, isUpdate: true);

            if (imageFile != null)
            {
                using var stream = imageFile.OpenReadStream();
                existingTrainer.Img = await _cloudStorage.UploadFileAsync(
                    stream,
                    $"trainer_{Guid.NewGuid()}{Path.GetExtension(imageFile.FileName)}");
            }

            var user = await _userService.GetUserByIdAsync(existingTrainer.UserId);
            if (user == null)
                throw new ApiException("USER_NOT_FOUND", "Пользователь не найден", HttpStatusCode.NotFound);

            user.Email = trainer.User!.Email;
            user.FirstName = trainer.User.FirstName;
            user.LastName = trainer.User.LastName;

            await _userService.UpdateUserAsync(user);

            existingTrainer.Description = trainer.Description;
            existingTrainer.Specialization = trainer.Specialization;
            existingTrainer.ExperienceYears = trainer.ExperienceYears;
            existingTrainer.CenterId = trainer.CenterId;

            _context.Trainers.Update(existingTrainer);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var trainer = await _context.Trainers
                    .FirstOrDefaultAsync(t => t.TrainerId == id);

                if (trainer == null)
                {
                    throw new ApiException("TRAINER_NOT_FOUND", "Тренер не найден", HttpStatusCode.NotFound);
                }

                var userId = trainer.UserId;

                _context.Trainers.Remove(trainer);
                await _context.SaveChangesAsync();

                if (trainer.UserId != 0)
                {
                    await _userService.DeleteUserAsync(trainer.UserId);
                }

                await transaction.CommitAsync();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                await transaction.RollbackAsync();
                var exists = await _context.Trainers.AnyAsync(t => t.TrainerId == id);
                if (!exists)
                {
                    return; 
                }
                throw new ApiException("DELETE_FAILED", "Не удалось удалить тренера", HttpStatusCode.InternalServerError);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Stream?> GetTrainerImageAsync(int trainerId)
        {
            var trainer = await _context.Trainers
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.TrainerId == trainerId);

            if (trainer == null || string.IsNullOrEmpty(trainer.Img))
                return null;

            return await _cloudStorage.DownloadFileAsync(trainer.Img);
        }

        private Dictionary<string, string[]> ValidateTrainer(Trainer trainer, bool isUpdate = false)
        {
            var errors = new Dictionary<string, string[]>();

            if (trainer.User == null)
            {
                errors.Add("User", ["Данные пользователя обязательны"]);
                return errors;
            }

            if (string.IsNullOrWhiteSpace(trainer.User.Email))
            {
                errors.Add(nameof(trainer.User.Email), ["Email обязателен"]);
            }
            else if (!Regex.IsMatch(trainer.User.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                errors.Add(nameof(trainer.User.Email), ["Неверный формат email"]);
            }

            if (string.IsNullOrWhiteSpace(trainer.User.FirstName))
            {
                errors.Add(nameof(trainer.User.FirstName), ["Имя обязательно"]);
            }

            if (string.IsNullOrWhiteSpace(trainer.User.LastName))
            {
                errors.Add(nameof(trainer.User.LastName), ["Фамилия обязательна"]);
            }

            if (trainer.CenterId <= 0)
            {
                errors.Add(nameof(trainer.CenterId), ["Центр обязателен"]);
            }

            return errors;
        }

        private async Task CheckTrainerConstraints(Trainer trainer, bool isUpdate = false)
        {
            var existingUser = await _userService.GetUserByIdAsync(trainer.UserId);
            if (existingUser != null && existingUser.Email == trainer.User?.Email &&
                (isUpdate ? existingUser.UserId != trainer.UserId : true))
            {
                throw new ApiException("EMAIL_EXISTS",
                    $"Пользователь с email {trainer.User.Email} уже существует",
                    HttpStatusCode.BadRequest);
            }

            var center = await _centerRepository.GetByIdAsync(trainer.CenterId);
            if (center == null)
            {
                throw new ApiException("CENTER_NOT_FOUND",
                    $"Центр с ID {trainer.CenterId} не найден",
                    HttpStatusCode.NotFound);
            }
        }
    }
}
