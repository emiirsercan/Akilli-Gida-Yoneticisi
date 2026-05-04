using FoodApp.Domain.Entities;

namespace FoodApp.Application.Interfaces;

public interface IFoodItemRepository
{
    Task<FoodItem?> GetByIdAsync(Guid id);
    Task<IEnumerable<FoodItem>> GetAllByUserIdAsync(Guid userId);
    Task AddAsync(FoodItem foodItem);
    Task UpdateAsync(FoodItem foodItem);
    Task DeleteAsync(FoodItem foodItem);
}
