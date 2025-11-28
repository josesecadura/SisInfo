using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Fylt.Infrastructure.Context.Configurations
{
    public class PeliculaConfiguration : IEntityTypeConfiguration<Pelicula>
    {
        public void Configure(EntityTypeBuilder<Pelicula> builder)
        {
            builder.ToTable("pelicula");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.ExternalId).HasColumnName("external_id");
            builder.Property(x => x.Titulo).HasColumnName("titulo");
            builder.Property(x => x.Descripcion).HasColumnName("descripcion");
            builder.Property(x => x.Fecha).HasColumnName("fecha");
            builder.Property(x => x.Imagen).HasColumnName("imagen");
            builder.Property(x => x.Valoracion).HasColumnName("valoracion");

            // === CONFIGURACIÓN PARA LIST<string> ===
            builder.Property(x => x.Generos)
                .HasColumnName("generos")
                .HasConversion(
                    // De List<string> a string para la BD
                    v => string.Join(",", v),
                    // De string a List<string> al leer
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList()
                )
                // Necesario para que EF detecte cambios en listas
                .Metadata.SetValueComparer(new ValueComparer<List<string>>(
                    (c1, c2) => c1.SequenceEqual(c2),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()
                ));
        }
    }
}
