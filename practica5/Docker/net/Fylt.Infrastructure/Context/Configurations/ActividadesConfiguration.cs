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

            builder.HasKey(x => x.IdUser);

            builder.Property(x => x.IdUser).HasColumnName("id_user");
            builder.Property(x => x.Genero).HasColumnName("genero");
            builder.Property(x => x.Actor).HasColumnName("actor");

            builder.HasOne(x => x.Usuario)
                .WithOne(x => x.Actividades)
                .HasForeignKey<Actividad>(x => x.IdUser)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
