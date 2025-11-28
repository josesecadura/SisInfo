using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fylt.Infrastructure.Context.Configurations
{
    public class ListaPeliculaConfiguration : IEntityTypeConfiguration<ListaPelicula>
    {
        public void Configure(EntityTypeBuilder<ListaPelicula> builder)
        {
            builder.ToTable("lista_pelicula");

            builder.HasKey(x => new { x.IdLista, x.IdPelicula });

            builder.Property(x => x.IdLista).HasColumnName("id_lista");
            builder.Property(x => x.IdPelicula).HasColumnName("id_pelicula");

            // Relaciones
            builder.HasOne(x => x.Lista)
                .WithMany(x => x.Peliculas)
                .HasForeignKey(x => x.IdLista)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Pelicula)
                .WithMany(x => x.Listas)
                .HasForeignKey(x => x.IdPelicula)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
