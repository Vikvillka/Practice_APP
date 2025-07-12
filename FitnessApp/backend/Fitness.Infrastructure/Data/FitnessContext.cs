using Fitness.Core.Entities;
using Fitness.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fitness.Infrastructure.Data
{
    public class FitnessContext : IdentityDbContext<AppUser, IdentityRole<int>, int>
    {

        public FitnessContext(DbContextOptions<FitnessContext> options) : base(options) { }

        public DbSet<Center> Centers { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Trainer> Trainers { get; set; }
        public DbSet<Training> Trainings { get; set; }
        public DbSet<Template> Templates { get; set; }
        public DbSet<Token> Tokens { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Order>()
                .HasOne<AppUser>() 
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.Entity<Trainer>()
                .HasOne<AppUser>()
                .WithOne()
                .HasForeignKey<Trainer>(t => t.UserId)  
                .OnDelete(DeleteBehavior.Cascade);
            builder.Entity<Token>()
                .HasOne<AppUser>()
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
