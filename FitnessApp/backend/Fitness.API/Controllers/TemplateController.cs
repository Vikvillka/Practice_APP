using Fitness.Core.Interfaces;
using Fitness.Core.Services;
using Microsoft.AspNetCore.Mvc;
using Fitness.API.DTOs.Center;
using Fitness.Core.Entities;
using Fitness.Core.Exceptions;
using Microsoft.AspNetCore.Authorization;
using System.Net;
using System.Threading.Tasks;
using Fitness.API.DTOs.Template;

namespace Fitness.API.Controllers
{
    [ApiController]
    [Route("api/template")]
    public class TemplateController : ControllerBase
    {
        private readonly ITemplateService _templateService;
        private readonly ILogger<TemplateController> _logger;

        public TemplateController(
           ITemplateService templateService,
           ILogger<TemplateController> logger)
        {
            _templateService = templateService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTemplates()
        {
            try
            {
                var templates = await _templateService.GetAll();
                return Ok(templates.Select(c => new TemplateDto
                {
                    TemplateId = c.TemplateId,
                    TrainerId = c.TrainerId,
                    Title = c.Title,
                    Description = c.Description,
                    Duration = c.Duration,
                    MaxParticipants = c.MaxParticipants
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка шаблонов");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpGet("{templateId}")]
        public async Task<IActionResult> GetTemplateById(int templateId)
        {
            try
            {
                var template = await _templateService.GetById(templateId);
                return Ok(new TemplateDto
                {
                    TemplateId = template.TemplateId,
                    TrainerId = template.TrainerId,
                    Title = template.Title,
                    Description = template.Description,
                    Duration = template.Duration,
                    MaxParticipants = template.MaxParticipants
                });
            }
            catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return NotFound(new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка шаблонов");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpGet("{trainerId}/templates")]
        public async Task<IActionResult> GetTemplateForUserById(int trainerId)
        {
            try
            {
                var template = await _templateService.GetByIdTrainer(trainerId);
                return Ok(template.Select(t => new TemplateDto
                {
                    TemplateId = t.TemplateId,
                    TrainerId = t.TrainerId,
                    Title = t.Title,
                    Description = t.Description,
                    Duration = t.Duration,
                    MaxParticipants = t.MaxParticipants
                }));
            }
            catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return NotFound(new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка шаблонов");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpPost]
        //[Authorize(Policy = "Admin")]
        public async Task<IActionResult> CreateеTemplate([FromBody] TemplateRequest dto)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }
            try
            {
                var template = new Template
                {
                    TrainerId = dto.TrainerId,
                    Title = dto.Title,
                    Description = dto.Description,
                    Duration = dto.Duration,
                    MaxParticipants = dto.MaxParticipants
                };

                await _templateService.Add(template);

                return Ok(new TemplateDto
                {
                    TemplateId = template.TemplateId,
                    TrainerId = template.TrainerId,
                    Title = template.Title,
                    Description = template.Description,
                    Duration = template.Duration,
                    MaxParticipants = template.MaxParticipants
                });
            }
            catch (ValidException ex)
            {
                return BadRequest(new { Errors = ex.Errors });
            }
            catch (ApiException ex)
            {
                return NotFound(new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании шаблона");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpDelete("{templateId}")]
        public async Task<IActionResult> DeleteTemplate(int templateId)
        {
            try
            {
                await _templateService.DeleteById(templateId);
                return Ok();
            }
            catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return NotFound(new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при удалении шаблона с ID {templateId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }
    }
}
