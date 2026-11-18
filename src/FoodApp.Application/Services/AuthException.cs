namespace FoodApp.Application.Services;

public enum AuthError
{
    InvalidCredentials,
    EmailInUse
}

public sealed class AuthException(AuthError error) : Exception(error.ToString())
{
    public AuthError Error { get; } = error;
}
