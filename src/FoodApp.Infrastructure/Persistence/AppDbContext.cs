using FoodApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FoodApp.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<FoodItem> FoodItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(builder =>
        {
            builder.HasKey(u => u.Id);
            builder.HasIndex(u => u.Email).IsUnique();
            builder.HasMany(u => u.FoodItems)
                   .WithOne(f => f.User)
                   .HasForeignKey(f => f.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FoodItem>(builder =>
        {
            builder.HasKey(f => f.Id);
            builder.Property(f => f.Name).IsRequired();
        });
        
        base.OnModelCreating(modelBuilder);
    }
}
