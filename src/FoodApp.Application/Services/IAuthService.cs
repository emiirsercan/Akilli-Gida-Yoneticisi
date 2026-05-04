using FoodApp.Application.DTOs.Auth;

namespace FoodApp.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<bool> VerifyEmailAsync(VerifyEmailRequest request);
}
