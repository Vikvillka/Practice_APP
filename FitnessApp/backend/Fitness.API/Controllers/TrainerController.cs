using Fitness.API.DTOs.Auth;
using Fitness.API.DTOs.Center;
using Fitness.API.DTOs.Trainer;
using Fitness.Core.Entities;
using Fitness.Core.Exceptions;
using Fitness.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Fitness.API.Controllers
{
    [ApiController]
    [Route("api/trainer")]
    public class TrainerController : ControllerBase
    {
        private readonly ITrainerService _trainerService;
        private readonly ILogger<TrainerController> _logger;

        public TrainerController(
            ITrainerService trainerService,
            ILogger<TrainerController> logger)
        {
            _trainerService = trainerService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetTrainers()
        {
            try
            {
                var trainers = await _trainerService.GetAllAsync();
                var result = trainers.Select(t => new TrainerDto
                {
                    TrainerId = t.TrainerId,
                    UserId = t.UserId,
                    User = t.User != null ? new UserDto
                    {
                        UserId = t.User.UserId,
                        Email = t.User.Email,
                        FirstName = t.User.FirstName,
                        LastName = t.User.LastName
                    } : null,
                    Description = t.Description,
                    Specialization = t.Specialization,
                    ExperienceYears = t.ExperienceYears,
                    ImgUrl = t.Img,
                    CenterId = t.CenterId,
                    Center = t.Center != null ? new CenterDto
                    {
                        CenterId = t.Center.CenterId,
                        CenterName = t.Center.CenterName
                    } : null
                });

                return Ok(result);
            }
            catch (ApiException ex)
            {
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка тренеров");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetTrainersById(int userId)
        {
            try
            {
                var trainer = await _trainerService.GetByIdAsync(userId);

                var result = new TrainerDto 
                {
                    TrainerId = trainer.TrainerId,
                    UserId = trainer.UserId,
                    User = trainer.User != null ? new UserDto
                    {
                        UserId = trainer.User.UserId,
                        Email = trainer.User.Email,
                        FirstName = trainer.User.FirstName,
                        LastName = trainer.User.LastName
                    } : null,
                    Description = trainer.Description,
                    Specialization = trainer.Specialization,
                    ExperienceYears = trainer.ExperienceYears,
                    ImgUrl = trainer.Img,
                    CenterId = trainer.CenterId,
                    Center = trainer.Center != null ? new CenterDto
                    {
                        CenterId = trainer.Center.CenterId,
                        CenterName = trainer.Center.CenterName
                    } : null
                };

                return Ok(result);
            }
            catch (ApiException ex)
            {
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении тренера с ID {userId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpPost]
        //[Authorize(Policy = "Admin")]
        public async Task<IActionResult> CreateTrainer([FromForm] TrainerRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var trainer = new Trainer
                {
                    Description = request.Description,
                    Specialization = request.Specialization,
                    ExperienceYears = request.ExperienceYears,
                    CenterId = request.CenterId,
                    User = new User
                    {
                        Email = request.Email,
                        FirstName = request.FirstName,
                        LastName = request.LastName,
                        Role = UserRole.Trainer
                    }
                };

                await _trainerService.AddAsync(trainer, request.Password, request.Img);

                var result = new TrainerDto
                {
                    TrainerId = trainer.TrainerId,
                    UserId = trainer.UserId,
                    Email = trainer.User?.Email,
                    FirstName = trainer.User?.FirstName,
                    LastName = trainer.User?.LastName,
                    Description = trainer.Description,
                    Specialization = trainer.Specialization,
                    ExperienceYears = trainer.ExperienceYears,
                    ImgUrl = trainer.Img,
                    CenterId = trainer.CenterId
                };

                return CreatedAtAction(nameof(GetTrainersById), new { userId = trainer.UserId }, result);
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
                _logger.LogError(ex, "Ошибка при создании тренера");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }
        
        [HttpPut("{userId}")]
        //[Authorize(Policy = "Admin")]
        public async Task<IActionResult> UpdateTrainer(int userId, [FromForm] TrainerUpdateRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var trainer = new Trainer
                {
                    TrainerId = userId,
                    Description = request.Description,
                    Specialization = request.Specialization,
                    ExperienceYears = request.ExperienceYears,
                    CenterId = request.CenterId,
                    User = new User
                    {
                        Email = request.Email,
                        FirstName = request.FirstName,
                        LastName = request.LastName,
                    }
                };

                await _trainerService.UpdateAsync(trainer, request.Img);

                return Ok();
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
                _logger.LogError(ex, $"Ошибка при обновлении тренера с ID {userId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpDelete("{userId}")]
        //[Authorize(Policy = "Admin")]
        public async Task<IActionResult> DeleteTrainer(int userId)
        {
            try
            {
                await _trainerService.DeleteAsync(userId);
                return NoContent();
            }
            catch (ApiException ex)
            {
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при удалении тренера с ID {userId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpGet("{trainerId}/image")]
        public async Task<IActionResult> GetTrainerImage(int trainerId)
        {
            try
            {
                var imageStream = await _trainerService.GetTrainerImageAsync(trainerId);
                if (imageStream == null)
                {
                    return NotFound();
                }

                return File(imageStream, "image/jpeg"); 
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении изображения тренера с ID {trainerId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }
    }
}
