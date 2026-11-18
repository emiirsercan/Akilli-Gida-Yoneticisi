using FoodApp.Application.DTOs.Auth;
using FoodApp.Application.Interfaces;
using FoodApp.Domain.Entities;

namespace FoodApp.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtProvider _jwtProvider;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(IUserRepository userRepository, IJwtProvider jwtProvider, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _jwtProvider = jwtProvider;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var user = new User
        {
            Email = request.Email.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        if (!await _userRepository.TryAddAsync(user))
            throw new AuthException(AuthError.EmailInUse);

        return new AuthResponse("", user.Email, user.FirstName, user.LastName);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.Trim());
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new AuthException(AuthError.InvalidCredentials);

        var token = _jwtProvider.GenerateToken(user);
        return new AuthResponse(token, user.Email, user.FirstName, user.LastName);
    }
}
