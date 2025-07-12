using Fitness.Core.Exceptions;
using Fitness.Core.Interfaces;
using Fitness.API.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Fitness.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpOptions]
        public IActionResult Options()
        {
            return Ok();
        }

        [HttpPost("registration")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request) 
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
                _logger.LogInformation("Попытка регистрации {Email}", request.Email);
                var (accessToken, refreshToken, user) = await _authService.RegisterAsync(
                    request.ToUser(),
                    request.Password,
                    ipAddress);

                SetRefreshTokenCookie(refreshToken);

                return Ok(new AuthResponse
                {
                    AccessToken = accessToken,
                    User = new UserDto
                    {
                        UserId = user.UserId,
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Role = user.Role
                    }
                });
            }
            catch (ApiException ex)
            {
                _logger.LogWarning(ex, "\r\nОшибка API при регистрации");
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при регистрации");
                return StatusCode(
                    500,
                    new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
                _logger.LogInformation("Попытка входа {Email}", request.Email);

                var (accessToken, refreshToken, user) = await _authService.LoginAsync(
                   request.Email,
                   request.Password,
                   ipAddress);

                SetRefreshTokenCookie(refreshToken);

                return Ok(new AuthResponse
                {
                    AccessToken = accessToken,
                    User = new UserDto
                    {
                        UserId = user.UserId,
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Role = user.Role
                    }
                });
            }
            catch (ApiException ex)
            {
                _logger.LogWarning(ex, "Ошибка API при входе");
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при входе");
                return StatusCode(500, new { Message = "Произошла ошибка при обработке вашего запроса" });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"];
                if (string.IsNullOrEmpty(refreshToken))
                    return BadRequest(new { Message = "Refresh token отсутствует" });

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                await _authService.LogoutAsync(refreshToken, ipAddress);

                Response.Cookies.Delete("refreshToken");

                return Ok(new { Message = "Успешный выход из системы" });
            }
            catch (ApiException ex)
            {
                _logger.LogWarning(ex, "Ошибка при выходе из системы");
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при выходе из системы");
                return StatusCode(500, new { Message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpGet("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"];
                if (string.IsNullOrEmpty(refreshToken))
                    return Unauthorized(new { Message = "Refresh token отсутствует" });

                var accessToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                if (string.IsNullOrEmpty(accessToken))
                    return Unauthorized(new { Message = "Access token отсутствует" });

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                var (newAccessToken, newRefreshToken, user) = await _authService.RefreshTokenAsync(
                    accessToken,
                    refreshToken,
                    ipAddress);

                SetRefreshTokenCookie(newRefreshToken);

                return Ok(new
                {
                    accessToken = newAccessToken,
                    User = new UserDto
                    {
                        UserId = user.UserId,
                        Email = user.Email,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Role = user.Role
                    }
                });
            }
            catch (ApiException ex)
            {
                _logger.LogWarning(ex, "Ошибка при обновлении токена");
                return StatusCode((int)ex.StatusCode, new { ex.ErrorCode, ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении токена");
                return StatusCode(500, new { Message = "Внутренняя ошибка сервера" });
            }
        }

        private void SetRefreshTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7),
                Secure = true,
                SameSite = SameSiteMode.None,
            };
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }
    }
}
