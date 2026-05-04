namespace FoodApp.Application.DTOs.Auth;

public record AuthResponse(string Token, string Email, string FirstName, string LastName);
