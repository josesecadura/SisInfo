using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fylt.Infrastructure.Context.Configurations
{
    public class ComentarioConfiguration : IEntityTypeConfiguration<Comentario>
    {
        public void Configure(EntityTypeBuilder<Comentario> builder)
        {
            builder.ToTable("comentario");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.IdUser).HasColumnName("id_user");
            builder.Property(x => x.IdPelicula).HasColumnName("id_pelicula");
            builder.Property(x => x.Descripcion).HasColumnName("descripcion");
            builder.Property(x => x.NumLikes).HasColumnName("num_likes");
            builder.Property(x => x.Aprobado).HasColumnName("aprobado");
            builder.Property(x => x.Visible).HasColumnName("visible");
            builder.Property(x => x.FechaCreacion).HasColumnName("fecha_creacion");
            builder.HasOne(x => x.Usuario)
                .WithMany()
                .HasForeignKey(x => x.IdUser)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Pelicula)
                .WithMany(x => x.Comentarios)
                .HasForeignKey(x => x.IdPelicula)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
