using FoodApp.Application.DTOs.FoodItems;

namespace FoodApp.Application.Services;

public interface IFoodItemService
{
    Task<IEnumerable<FoodItemDto>> GetAllAsync(Guid userId);
    Task<FoodItemDto> GetByIdAsync(Guid id, Guid userId);
    Task<FoodItemDto> CreateAsync(CreateFoodItemRequest request, Guid userId);
    Task<FoodItemDto> UpdateAsync(Guid id, UpdateFoodItemRequest request, Guid userId);
    Task DeleteAsync(Guid id, Guid userId);
}
