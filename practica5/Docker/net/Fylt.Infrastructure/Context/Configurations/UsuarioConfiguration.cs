using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fylt.Infrastructure.Context.Configurations
{
    public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
    {
        public void Configure(EntityTypeBuilder<Usuario> builder)
        {
            builder.ToTable("usuario");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.RealName).HasColumnName("real_name");
            builder.Property(x => x.Username).HasColumnName("username");
            builder.Property(x => x.Email).HasColumnName("email");
            builder.Property(x => x.Descripcion).HasColumnName("descripcion");
            builder.Property(x => x.Seguidores).HasColumnName("seguidores");
            builder.Property(x => x.Seguidos).HasColumnName("seguidos");
            builder.Property(x => x.Foto).HasColumnName("foto");
            builder.Property(x => x.Password).HasColumnName("password");
            builder.Property(x => x.BoolAdmin).HasColumnName("bool_admin");
        }
    }
}
