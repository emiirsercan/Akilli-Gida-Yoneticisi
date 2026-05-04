using System.ComponentModel.DataAnnotations;

namespace FoodApp.Application.DTOs.FoodItems;

public record CreateFoodItemRequest(
    [Required] string Name,
    string? Barcode,
    [Required] DateTime ExpirationDate,
    [Required] [Range(1, 10000)] int Quantity
);
