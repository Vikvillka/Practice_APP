using Fitness.API.DTOs.Center;
using Fitness.Core.Entities;
using Fitness.Core.Exceptions;
using Fitness.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Fitness.API.Controllers
{
    [ApiController]
    [Route("api/center")]
    public class CenterController : ControllerBase
    {
        private readonly ICenterService _centerService;
        private readonly ILogger<CenterController> _logger;

        public CenterController(
            ICenterService centerService,
            ILogger<CenterController> logger)
        {
            _centerService = centerService;
            _logger = logger;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetAllCenters()
        {
            try
            {
                var centers = await _centerService.GetAll();
                return Ok(centers.Select(c => new CenterDto
                {
                    CenterId = c.CenterId,
                    CenterName = c.CenterName,
                    City = c.City,
                    Address = c.Address,
                    Phone = c.Phone,
                    Latitude = c.Latitude,
                    Longitude = c.Longitude
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка центров");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpGet("{centerId}")]
        public async Task<IActionResult> GetCenterById(int centerId)
        {
            try
            {
                var center = await _centerService.GetById(centerId);
                return Ok(new CenterDto
                {
                    CenterId = center.CenterId,
                    CenterName = center.CenterName,
                    City = center.City,
                    Address = center.Address,
                    Phone = center.Phone,
                    Latitude = center.Latitude,
                    Longitude = center.Longitude
                });
            }
            catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return NotFound(new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении центра с ID {centerId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpPost]
        //[Authorize(Policy = "Admin")]
        public async Task<IActionResult> CreateCenter([FromBody] CenterRequest dto)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var center = new Center
                {
                    CenterName = dto.CenterName,
                    City = dto.City,
                    Address = dto.Address,
                    Phone = dto.Phone,
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude
                };

                await _centerService.Add(center);

                return Ok(new CenterDto
                {
                    CenterId = center.CenterId,
                    CenterName = center.CenterName,
                    City = center.City,
                    Address = center.Address,
                    Phone = center.Phone,
                    Latitude = center.Latitude,
                    Longitude = center.Longitude
                });
            }
            catch (ValidException ex)
            {
                return BadRequest(new { Errors = ex.Errors });
            }
            catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.Conflict)
            {
                return Conflict(new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании центра");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpPut("{centerId}")]
        //[Authorize(Policy = "Admin")]
        public async Task<IActionResult> UpdateCenter(int centerId, [FromBody] CenterRequest dto)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var center = new Center
                {
                    CenterId = centerId,
                    CenterName = dto.CenterName,
                    City = dto.City,
                    Address = dto.Address,
                    Phone = dto.Phone,
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude
                };

                await _centerService.Update(center);
                return Ok();
            }
            catch (ValidException ex)
            {
                return BadRequest(new { Errors = ex.Errors });
            }
            catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return NotFound(new { ex.ErrorCode, ex.Message });
            }
            catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.Conflict)
            {
                return Conflict(new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при обновлении центра с ID {centerId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpDelete("{centerId}")]
        //[Authorize(Policy = "Admin")]
        public async Task<IActionResult> DeleteCenter(int centerId)
        {
            try
            {
                await _centerService.Delete(centerId);
                return Ok();
            }
            catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                return NotFound(new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при удалении центра с ID {centerId}");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }
    }
}
