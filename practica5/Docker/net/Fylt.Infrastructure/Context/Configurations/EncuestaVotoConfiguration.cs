using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fylt.Infrastructure.Context.Configurations
{
    public class EncuestaVotoConfiguration : IEntityTypeConfiguration<EncuestaVoto>
    {
        public void Configure(EntityTypeBuilder<EncuestaVoto> builder)
        {
            builder.ToTable("encuesta_voto");

            builder.HasKey(x => new { x.IdUser, x.IdEncuesta });

            builder.Property(x => x.IdUser).HasColumnName("id_user");
            builder.Property(x => x.IdEncuesta).HasColumnName("id_encuesta");
            builder.Property(x => x.OpcionVotada).HasColumnName("opcion_votada");

            builder.HasOne(x => x.Usuario)
                .WithMany()
                .HasForeignKey(x => x.IdUser)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Encuesta)
                .WithMany()
                .HasForeignKey(x => x.IdEncuesta)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}