using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

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
        }
    }
}
