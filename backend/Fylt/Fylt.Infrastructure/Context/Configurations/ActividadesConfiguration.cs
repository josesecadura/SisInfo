using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fylt.Infrastructure.Context.Configurations
{
    public class ActividadesConfiguration : IEntityTypeConfiguration<Actividades>
    {
        public void Configure(EntityTypeBuilder<Actividades> builder)
        {
            builder.ToTable("actividades");

            builder.HasKey(x => x.IdUser);

            builder.Property(x => x.IdUser).HasColumnName("id_user");
            builder.Property(x => x.Genero).HasColumnName("genero");
            builder.Property(x => x.Actor).HasColumnName("actor");

            builder.HasOne(x => x.Usuario)
                .WithOne(x => x.Actividades)
                .HasForeignKey<Actividades>(x => x.IdUser)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
