using FoodApp.Application.Interfaces;
using FoodApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodApp.Infrastructure.Persistence.Repositories;

public class FoodItemRepository : IFoodItemRepository
{
    private readonly AppDbContext _context;

    public FoodItemRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<FoodItem?> GetByIdAsync(Guid id)
    {
        return await _context.FoodItems.FindAsync(id);
    }

    public async Task<IEnumerable<FoodItem>> GetAllByUserIdAsync(Guid userId)
    {
        return await _context.FoodItems
            .Where(f => f.UserId == userId)
            .OrderBy(f => f.ExpirationDate)
            .ToListAsync();
    }

    public async Task AddAsync(FoodItem foodItem)
    {
        await _context.FoodItems.AddAsync(foodItem);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(FoodItem foodItem)
    {
        _context.FoodItems.Update(foodItem);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(FoodItem foodItem)
    {
        _context.FoodItems.Remove(foodItem);
        await _context.SaveChangesAsync();
    }
}
