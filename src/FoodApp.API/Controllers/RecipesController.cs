using System.Security.Claims;
using FoodApp.Application.DTOs.Recipes;
using FoodApp.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodApp.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RecipesController : ControllerBase
{
    private readonly IRecipeService _recipeService;

    public RecipesController(IRecipeService recipeService)
    {
        _recipeService = recipeService;
    }

    [HttpPost("suggest")]
    public async Task<IActionResult> GetSuggestions([FromBody] RecipeSuggestionRequest request)
    {
        try
        {
            if (request.Ingredients == null || request.Ingredients.Count == 0)
                return BadRequest(new { Error = "En az bir malzeme girmelisiniz." });

            var result = await _recipeService.GetSuggestionsAsync(request.Ingredients);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}
