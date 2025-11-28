using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fylt.Infrastructure.Context.Configurations
{
    public class UsuarioSeguidorConfiguration : IEntityTypeConfiguration<UsuarioSeguidor>
    {
        public void Configure(EntityTypeBuilder<UsuarioSeguidor> builder)
        {
            builder.ToTable("usuario_seguidor", "sisinf_p3");
            builder.HasKey(x => new { x.IdUser, x.IdAmigo });

            builder.Property(x => x.IdUser).HasColumnName("id_user");
            builder.Property(x => x.IdAmigo).HasColumnName("id_amigo");

            builder.HasOne(x => x.Usuario)
                            .WithMany(u => u.SeguidosUsuarios)
                            .HasForeignKey(x => x.IdUser)
                            .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Amigo)
                            .WithMany(u => u.SeguidoresUsuarios)
                            .HasForeignKey(x => x.IdAmigo)
                            .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
