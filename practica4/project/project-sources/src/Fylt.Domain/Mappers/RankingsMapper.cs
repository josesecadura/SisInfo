using Fylt.Domain.VOs.RankingVO;
using Fylt.Infrastructure.DAOs;
using System.Collections.Generic;
using System.Linq;

namespace Fylt.Domain.Mappers
{
    public static class RankingsMappers
    {
        public static RankingVO ToVO(Ranking entity)
        {
            if (entity == null) return null!;
            return new RankingVO
            {
                Id = entity.Id,
                Titulo = entity.Titulo,
                Descripcion = entity.Descripcion,
                Tipo = entity.Tipo,
                Periodo = entity.Periodo,
                Fecha = entity.Fecha
            };
        }

        public static IEnumerable<RankingVO> ToVOList(IEnumerable<Ranking> entities)
        {
            if (entities == null) return Enumerable.Empty<RankingVO>();
            return entities.Select(ToVO);
        }

        public static Ranking ToEntity(RankingVO vo)
        {
            if (vo == null) return null!;
            return new Ranking
            {
                Id = vo.Id,
                Titulo = vo.Titulo,
                Descripcion = vo.Descripcion,
                Tipo = vo.Tipo,
                Periodo = vo.Periodo,
                Fecha = vo.Fecha.HasValue
                 ? DateTime.SpecifyKind(vo.Fecha.Value, DateTimeKind.Utc)
                 : (DateTime?)null,
            };
        }
    }
}