using FoodApp.Application.DTOs.Recipes;

namespace FoodApp.Application.Services;

public interface IRecipeService
{
    Task<RecipeSuggestionResponse> GetSuggestionsAsync(List<string> ingredients);
}
