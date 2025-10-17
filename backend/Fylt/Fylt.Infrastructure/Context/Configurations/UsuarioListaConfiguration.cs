using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fylt.Infrastructure.Context.Configurations
{
    public class UsuarioListaConfiguration : IEntityTypeConfiguration<UsuarioLista>
    {
        public void Configure(EntityTypeBuilder<UsuarioLista> builder)
        {
            builder.ToTable("usuario_lista");

            builder.HasKey(x => new { x.IdUser, x.IdLista });

            builder.Property(x => x.IdUser).HasColumnName("id_user");
            builder.Property(x => x.IdLista).HasColumnName("id_lista");

            builder.HasOne(x => x.Usuario)
                .WithMany(x => x.UsuarioListas)
                .HasForeignKey(x => x.IdUser)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Lista)
                .WithMany(x => x.Usuarios)
                .HasForeignKey(x => x.IdLista)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
