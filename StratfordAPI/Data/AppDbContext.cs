using Microsoft.EntityFrameworkCore;
using StratfordAPI.Models;

namespace StratfordAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Candidato> Candidatos { get; set; }
    }
}