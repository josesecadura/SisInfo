using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Fylt.Infrastructure.Context.Configurations
{
    public class RankingItemConfiguration : IEntityTypeConfiguration<RankingItem>
    {
        public void Configure(EntityTypeBuilder<RankingItem> builder)
        {
            builder.ToTable("ranking_item");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id).HasColumnName("id");
            builder.Property(x => x.IdRanking).HasColumnName("id_ranking");
            builder.Property(x => x.IdPelicula).HasColumnName("id_pelicula");
            builder.Property(x => x.Posicion).HasColumnName("posicion");
            builder.Property(x => x.Score).HasColumnName("score");

            builder.HasOne(x => x.Ranking)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.IdRanking)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Pelicula)
                .WithMany(x => x.RankingItems)
                .HasForeignKey(x => x.IdPelicula)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
