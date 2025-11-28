using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fylt.Infrastructure.Context.Configurations
{
    internal class ComentarioLikeConfiguration : IEntityTypeConfiguration<ComentarioLike>
    {
        public void Configure(EntityTypeBuilder<ComentarioLike> builder)
        {
            // Tabla y esquema
            builder.ToTable("comentario_like", "sisinf_p3");

            // Clave compuesta (equivalente a UNIQUE + comportamiento de identificación)
            builder.HasKey(e => new { e.IdUser, e.IdComentario });

            // Columnas (snake_case)
            builder.Property(e => e.IdUser).HasColumnName("id_user");
            builder.Property(e => e.IdComentario).HasColumnName("id_comentario");
            builder.Property(e => e.Fecha).HasColumnName("fecha");

            // Índices (según DDL)
            builder.HasIndex(e => e.IdUser).HasDatabaseName("idx_like_user");
            builder.HasIndex(e => e.IdComentario).HasDatabaseName("idx_like_comentario");

            // Relaciones y FK con borrado en cascada
            builder.HasOne(e => e.Usuario)
                   .WithMany() // si Usuario tuviera una colección, ponerla aquí
                   .HasForeignKey(e => e.IdUser)
                   .HasConstraintName("fk_like_user")
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.Comentario)
                   .WithMany() // si Comentario tuviera una colección, ponerla aquí
                   .HasForeignKey(e => e.IdComentario)
                   .HasConstraintName("fk_like_comentario")
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}