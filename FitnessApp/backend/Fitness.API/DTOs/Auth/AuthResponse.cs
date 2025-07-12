namespace Fitness.API.DTOs.Auth
{
    public class AuthResponse
    {
        public string AccessToken { get; set; } = null!;
        public UserDto User { get; set; } = null!;
    }
}
