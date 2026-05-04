using System.Security.Claims;
using FoodApp.Application.DTOs.FoodItems;
using FoodApp.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodApp.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FoodItemsController : ControllerBase
{
    private readonly IFoodItemService _foodItemService;

    public FoodItemsController(IFoodItemService foodItemService)
    {
        _foodItemService = foodItemService;
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            throw new UnauthorizedAccessException("Invalid token.");
        return userId;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var userId = GetUserId();
            var items = await _foodItemService.GetAllAsync(userId);
            return Ok(items);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var userId = GetUserId();
            var item = await _foodItemService.GetByIdAsync(id, userId);
            return Ok(item);
        }
        catch (Exception ex)
        {
            return NotFound(new { Error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateFoodItemRequest request)
    {
        try
        {
            var userId = GetUserId();
            var item = await _foodItemService.CreateAsync(request, userId);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateFoodItemRequest request)
    {
        try
        {
            var userId = GetUserId();
            var item = await _foodItemService.UpdateAsync(id, request, userId);
            return Ok(item);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var userId = GetUserId();
            await _foodItemService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}
