namespace FoodApp.Application.DTOs.Recipes;

public record RecipeSuggestionRequest(List<string> Ingredients);

public record RecipeStep(int StepNumber, string Description);

public record RecipeSuggestion(
    string Name,
    string Description,
    List<string> Ingredients,
    List<RecipeStep> Steps,
    string PrepTime,
    string Difficulty,
    string Tips
);

public record RecipeSuggestionResponse(List<RecipeSuggestion> Recipes);
