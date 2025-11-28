using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fylt.Infrastructure.Context.Configurations
{
    public class EncuestaConfiguration : IEntityTypeConfiguration<Encuesta>
    {
        public void Configure(EntityTypeBuilder<Encuesta> builder)
        {
            builder.ToTable("encuesta");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.IdAdmin).HasColumnName("id_admin");
            builder.Property(x => x.Pregunta).HasColumnName("pregunta");

            builder.Property(x => x.Fecha).HasColumnName("fecha");
            builder.Property(x => x.Opcion1).HasColumnName("opcion1");
            builder.Property(x => x.Opcion2).HasColumnName("opcion2");
            builder.Property(x => x.Opcion3).HasColumnName("opcion3");
            builder.Property(x => x.Opcion4).HasColumnName("opcion4");
            builder.Property(x => x.Porcentaje1).HasColumnName("porcentaje1");
            builder.Property(x => x.Porcentaje2).HasColumnName("porcentaje2");
            builder.Property(x => x.Porcentaje3).HasColumnName("porcentaje3");
            builder.Property(x => x.Porcentaje4).HasColumnName("porcentaje4");
            builder.Property(x => x.Activo).HasColumnName("activo");

            builder.HasOne(x => x.Admin)
                .WithMany(x => x.EncuestasCreadas)
                .HasForeignKey(x => x.IdAdmin)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
