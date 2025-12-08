using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fylt.Infrastructure.Context.Configurations
{
    public class ActividadesConfiguration : IEntityTypeConfiguration<Actividad>
    {
        public void Configure(EntityTypeBuilder<Actividad> builder)
        {
            builder.ToTable("actividades");

            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).HasColumnName("id");

            // 2. Mapeo de nuevas columnas de Log
            builder.Property(x => x.TipoActividad)
                   .HasColumnName("tipo_actividad")
                   .IsRequired(); // Asegura NOT NULL

            builder.Property(x => x.FechaAccion)
                   .HasColumnName("fecha_accion")
                   .IsRequired(); // Asegura NOT NULL

            builder.Property(x => x.Detalles)
                   .HasColumnName("detalles");

            builder.Property(x => x.IdUsuario)
                   .HasColumnName("id_usuario"); // <-- CRÍTICO: Debe ser minúsculas y snake_case

            builder.HasOne(x => x.Usuario)
                   .WithMany(u => u.Actividades)
                   .HasForeignKey(x => x.IdUsuario) // Le decimos explícitamente que IdUsuario es la FK
                   .IsRequired(false) // Coincide con el NULLABLE de la base de datos
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}