using System.ComponentModel.DataAnnotations;

namespace FoodApp.Application.DTOs.Auth;

public record VerifyEmailRequest(
    [Required] [EmailAddress] string Email, 
    [Required] string Token
);
