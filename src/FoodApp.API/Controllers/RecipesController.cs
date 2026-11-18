using System.Text.Json;
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
    private readonly ILogger<RecipesController> _logger;

    public RecipesController(IRecipeService recipeService, ILogger<RecipesController> logger)
    {
        _recipeService = recipeService;
        _logger = logger;
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
        catch (Exception ex) when (ex is HttpRequestException or JsonException or TaskCanceledException)
        {
            _logger.LogWarning(ex, "Recipe provider request failed.");
            return StatusCode(StatusCodes.Status502BadGateway,
                new { Error = "Tarif önerileri şu anda alınamadı. Biraz sonra tekrar dene." });
        }
    }
}
