namespace FoodApp.Application.DTOs.FoodItems;

public record FoodItemDto(
    Guid Id,
    string Name,
    string? Barcode,
    DateTime ExpirationDate,
    int Quantity,
    DateTime CreatedAt
);
