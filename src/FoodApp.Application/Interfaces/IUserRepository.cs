using FoodApp.Domain.Entities;

namespace FoodApp.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<bool> TryAddAsync(User user);
}
