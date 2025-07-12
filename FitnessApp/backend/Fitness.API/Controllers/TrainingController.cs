using Fitness.API.DTOs.Template;
using Fitness.API.DTOs.Trainer;
using Fitness.API.DTOs.Training;
using Fitness.Core.Entities;
using Fitness.Core.Exceptions;
using Fitness.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Fitness.API.Controllers
{
    [ApiController]
    [Route("api/training")]
    public class TrainingController : ControllerBase
    {
        private readonly ITrainingService _trainingService;
        private readonly ILogger<TrainingController> _logger;

        public TrainingController(
            ITrainingService trainingService,
            ILogger<TrainingController> logger)
        {
            _trainingService = trainingService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetTrainings()
        {
            try
            {
                var trainings = await _trainingService.GetAll();
                return Ok(trainings.Select(t => new TrainingDto
                {
                    TrainingId = t.TrainingId,
                    DateTime = t.DateTime,
                    Price = t.Price,
                    Status = t.Status.ToString(),
                    TemplateId = t.TemplateId,
                    TrainerId = t.TrainerId,
                    CenterId = t.CenterId,
                    Template = t.Template != null ? new TemplateDto
                    {
                        TemplateId = t.Template.TemplateId,
                        Title = t.Template.Title,
                        Description = t.Template.Description,
                        MaxParticipants = t.Template.MaxParticipants,
                        Duration = t.Template.Duration
                    } : null,
                    Trainer = t.Trainer != null ? new TrainerDto
                    {
                        TrainerId = t.Trainer.TrainerId,
                        UserId = t.Trainer.UserId,
                        FirstName = t.Trainer.User?.FirstName,
                        LastName = t.Trainer.User?.LastName
                    } : null
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка тренировок");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpGet("{trainingId}")]
        public async Task<IActionResult> GetTrainingById(int trainingId)
        {
            try
            {
                var training = await _trainingService.GetById(trainingId);
                return Ok(new TrainingDto
                {
                    TrainingId = training.TrainingId,
                    DateTime = training.DateTime,
                    Price = training.Price,
                    Status = training.Status.ToString(),
                    TemplateId = training.TemplateId,
                    TrainerId = training.TrainerId,
                    CenterId = training.CenterId,
                    Template = training.Template != null ? new TemplateDto
                    {
                        TemplateId = training.Template.TemplateId,
                        Title = training.Template.Title,
                        Duration = training.Template.Duration,
                        Description = training.Template.Description,
                        MaxParticipants = training.Template.MaxParticipants,
                    } : null,
                    Trainer = training.Trainer != null ? new TrainerDto
                    {
                        TrainerId = training.Trainer.TrainerId,
                        FirstName = training.Trainer.User?.FirstName,
                        LastName = training.Trainer.User?.LastName
                    } : null
                });
            }
            catch (ApiException ex) 
            {
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении тренировки с ID {trainingId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpGet("{userId}/training")]
        public async Task<IActionResult> GetTrainingsForTrainer(int userId)
        {
            try
            {
                var trainings = await _trainingService.GetByIdTrainer(userId);
                return Ok(trainings.Select(t => new TrainingDto
                {
                    TrainingId = t.TrainingId,
                    DateTime = t.DateTime,
                    Price = t.Price,
                    Status = t.Status.ToString(),
                    TemplateId = t.TemplateId,
                    TrainerId = t.TrainerId,
                    CenterId = t.CenterId,
                    Template = t.Template != null ? new TemplateDto
                    {
                        TemplateId = t.Template.TemplateId,
                        Title = t.Template.Title,
                        Description = t.Template.Description,
                        MaxParticipants = t.Template.MaxParticipants,
                        Duration = t.Template.Duration
                    } : null
                }));
            }
            catch (ApiException ex) 
            {
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении тренировок для тренера с ID {userId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTraining([FromBody] TrainingRequest dto)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var training = new Training
                {
                    DateTime = dto.DateTime,
                    Price = dto.Price,
                    TemplateId = dto.TemplateId,
                    CenterId = dto.CenterId,
                    TrainerId = dto.TrainerId
                };

                await _trainingService.Add(training);

                return Ok(new TrainingDto
                {
                    TrainingId = training.TrainingId,
                    DateTime = training.DateTime,
                    Price = training.Price,
                    Status = training.Status.ToString(),
                    TemplateId = training.TemplateId,
                    TrainerId = training.TrainerId,
                    CenterId = training.CenterId
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
                _logger.LogError(ex, "Ошибка при создании тренировки");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpPut("{trainingId}/cancel")]
        public async Task<IActionResult> CancelTraining(int trainingId)
        {
            try
            {
                await _trainingService.Cancel(trainingId);
                return Ok();
            }
            catch (ApiException ex)
            {
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при отмене тренировки с ID {trainingId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpDelete("{trainingId}")]
        public async Task<IActionResult> DeleteTraining(int trainingId)
        {
            try
            {
                await _trainingService.Cancel(trainingId);
                return Ok();
            }
            catch (ApiException ex)
            {
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при удалении тренировки с ID {trainingId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }
    }
}
