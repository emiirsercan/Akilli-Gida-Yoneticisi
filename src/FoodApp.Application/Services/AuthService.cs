using FoodApp.Application.DTOs.Auth;
using FoodApp.Application.Interfaces;
using FoodApp.Domain.Entities;

namespace FoodApp.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtProvider _jwtProvider;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IEmailService _emailService;

    public AuthService(IUserRepository userRepository, IJwtProvider jwtProvider, IPasswordHasher passwordHasher, IEmailService emailService)
    {
        _userRepository = userRepository;
        _jwtProvider = jwtProvider;
        _passwordHasher = passwordHasher;
        _emailService = emailService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _userRepository.ExistsAsync(request.Email))
            throw new Exception("Email is already in use.");

        var passwordHash = _passwordHasher.Hash(request.Password);

        var verificationToken = Guid.NewGuid().ToString("N");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            FirstName = request.FirstName,
            LastName = request.LastName,
            VerificationToken = verificationToken,
            IsEmailVerified = false
        };

        await _userRepository.AddAsync(user);

        // Gerçek E-Posta Gönderimi
        var subject = "FoodApp - Lütfen E-postanızı Doğrulayın";
        var body = $@"
            <h2>FoodApp'e Hoşgeldiniz!</h2>
            <p>Hesabınızı doğrulamak için aşağıdaki kodu kullanın:</p>
            <h3 style='background:#f4f4f4; padding:10px;'>{verificationToken}</h3>
            <p>Eğer bu işlemi siz yapmadıysanız bu mesajı görmezden gelebilirsiniz.</p>
        ";
        
        await _emailService.SendEmailAsync(user.Email, subject, body);

        // API Cevabında artık token dönmüyoruz (güvenlik)
        return new AuthResponse("", user.Email, user.FirstName, user.LastName);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new Exception("Invalid email or password.");

        if (!user.IsEmailVerified)
            throw new Exception("Please verify your email address before logging in.");

        var token = _jwtProvider.GenerateToken(user);
        return new AuthResponse(token, user.Email, user.FirstName, user.LastName);
    }

    public async Task<bool> VerifyEmailAsync(VerifyEmailRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user is null)
            throw new Exception("User not found.");

        if (user.IsEmailVerified)
            return true;

        if (user.VerificationToken != request.Token)
            throw new Exception("Invalid verification token.");

        user.IsEmailVerified = true;
        user.VerificationToken = null;
        
        await _userRepository.UpdateAsync(user);

        return true;
    }
}
