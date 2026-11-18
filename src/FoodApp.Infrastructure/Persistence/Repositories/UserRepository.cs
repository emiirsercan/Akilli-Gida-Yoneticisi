using FoodApp.Application.Interfaces;
using FoodApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FoodApp.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.SingleOrDefaultAsync(u => u.Email == email);
    }

    public async Task<bool> TryAddAsync(User user)
    {
        await _context.Users.AddAsync(user);
        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException
            { SqlState: PostgresErrorCodes.UniqueViolation, ConstraintName: "IX_Users_Email" })
        {
            _context.Entry(user).State = EntityState.Detached;
            return false;
        }
    }

}
