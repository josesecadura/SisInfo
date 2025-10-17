using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fylt.Infrastructure.Context.Configurations
{
    public class RankingConfiguration : IEntityTypeConfiguration<Ranking>
    {
        public void Configure(EntityTypeBuilder<Ranking> builder)
        {
            builder.ToTable("ranking");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.Titulo).HasColumnName("titulo");
            builder.Property(x => x.Descripcion).HasColumnName("descripcion");
            builder.Property(x => x.Tipo).HasColumnName("tipo");
            builder.Property(x => x.Periodo).HasColumnName("periodo");
            builder.Property(x => x.Fecha).HasColumnName("fecha");
        }
    }
}
