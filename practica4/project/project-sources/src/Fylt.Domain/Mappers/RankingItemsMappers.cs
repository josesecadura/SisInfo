using Fylt.Domain.VOs;
using Fylt.Domain.VOs.RankingItemVO;
using Fylt.Infrastructure.DAOs; 
using System.Collections.Generic;
using System.Linq;

namespace Fylt.Domain.Mappers
{
    public static class RankingItemsMappers
    {
        public static RankingItemVO ToVO(RankingItem entity)
        {
            if (entity == null) return null!;
            return new RankingItemVO
            {
                Id = entity.Id,
                IdRanking = entity.IdRanking,
                IdPelicula = entity.IdPelicula,
                Posicion = entity.Posicion,
                Score = entity.Score
            };
        }

        public static IEnumerable<RankingItemVO> ToVOList(IEnumerable<RankingItem> entities)
        {
            if (entities == null) return Enumerable.Empty<RankingItemVO>();
            return entities.Select(ToVO);
        }

        public static RankingItem ToEntity(RankingItemVO vo)
        {
            if (vo == null) return null!;
            return new RankingItem
            {
                Id = vo.Id,
                IdRanking = vo.IdRanking,
                IdPelicula = vo.IdPelicula,
                Posicion = vo.Posicion,
                Score = vo.Score ?? 0 // Score puede estar null o 0
            };
        }
    }
}