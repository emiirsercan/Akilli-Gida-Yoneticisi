using FoodApp.Application.DTOs.FoodItems;
using FoodApp.Application.Interfaces;
using FoodApp.Domain.Entities;

namespace FoodApp.Application.Services;

public class FoodItemService : IFoodItemService
{
    private readonly IFoodItemRepository _repository;

    public FoodItemService(IFoodItemRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<FoodItemDto>> GetAllAsync(Guid userId)
    {
        var items = await _repository.GetAllByUserIdAsync(userId);
        return items.Select(MapToDto);
    }

    public async Task<FoodItemDto> GetByIdAsync(Guid id, Guid userId)
    {
        var item = await _repository.GetByIdAsync(id);
        
        if (item is null || item.UserId != userId)
            throw new Exception("Product not found or unauthorized.");

        return MapToDto(item);
    }

    public async Task<FoodItemDto> CreateAsync(CreateFoodItemRequest request, Guid userId)
    {
        var item = new FoodItem
        {
            UserId = userId,
            Name = request.Name,
            Barcode = request.Barcode,
            ExpirationDate = request.ExpirationDate,
            Quantity = request.Quantity
        };

        await _repository.AddAsync(item);
        return MapToDto(item);
    }

    public async Task<FoodItemDto> UpdateAsync(Guid id, UpdateFoodItemRequest request, Guid userId)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item is null || item.UserId != userId)
            throw new Exception("Product not found or unauthorized.");

        item.Name = request.Name;
        item.Barcode = request.Barcode;
        item.ExpirationDate = request.ExpirationDate;
        item.Quantity = request.Quantity;

        await _repository.UpdateAsync(item);
        return MapToDto(item);
    }

    public async Task DeleteAsync(Guid id, Guid userId)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item is null || item.UserId != userId)
            throw new Exception("Product not found or unauthorized.");

        await _repository.DeleteAsync(item);
    }

    private static FoodItemDto MapToDto(FoodItem item)
    {
        return new FoodItemDto(
            item.Id,
            item.Name,
            item.Barcode,
            item.ExpirationDate,
            item.Quantity,
            item.CreatedAt
        );
    }
}
