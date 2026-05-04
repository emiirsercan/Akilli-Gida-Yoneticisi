using FoodApp.Domain.Entities;

namespace FoodApp.Application.Interfaces;

public interface IJwtProvider
{
    string GenerateToken(User user);
}
