using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;

namespace Fylt.Infrastructure.Context
{
    public class FyltContext : DbContext
    {
        // Definir el contexto de la base de datos para poder usarla
        public FyltContext(DbContextOptions<FyltContext> options) : base(options) { }

        // DbSets
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Lista> Listas { get; set; }
        public DbSet<Encuesta> Encuestas { get; set; }
        public DbSet<Pelicula> Peliculas { get; set; }
        public DbSet<Comentario> Comentarios { get; set; }
        public DbSet<UsuarioLista> UsuarioListas { get; set; }
        public DbSet<ListaPelicula> ListaPeliculas { get; set; }
        public DbSet<UsuarioSeguidor> UsuarioSeguidores { get; set; }
        public DbSet<Actividad> Actividades { get; set; }
        public DbSet<Ranking> Rankings { get; set; }
        public DbSet<RankingItem> RankingItems { get; set; }
        public DbSet<ApiKey> ApiKeys { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("sisinf_p3"); // Establecer el esquema por defecto

            modelBuilder.Entity<Comentario>(entity =>
            {
                entity.ToTable("comentario", "sisinf_p3");

                // 🔹 Campos que EF no convierte automáticamente a snake_case
                entity.Property(e => e.Aprobado).HasColumnName("aprobado");
                entity.Property(e => e.Visible).HasColumnName("visible");
            });

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(FyltContext).Assembly); // Aplicar configuraciones

            base.OnModelCreating(modelBuilder);
        }
    }
}
