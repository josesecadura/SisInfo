using Fylt.Domain.VOs.ActividadesVOs;
using Fylt.Infrastructure.DAOs;
using System.Collections.Generic;
using System.Linq;

namespace Fylt.Domain.Mappers
{
    internal static class ActividadesMappers
    {
        public static ActividadVO ToVO(Actividad entity)
        {
            if (entity == null) return null!;

            return new ActividadVO
            {
                IdUser = entity.IdUser,
                Genero = entity.Genero,
                Actor = entity.Actor
            };
        }

        public static Actividad ToEntity(ActividadVO vo)
        {
            if (vo == null) return null!;

            return new Actividad
            {
                IdUser = vo.IdUser,
                Genero = vo.Genero,
                Actor = vo.Actor
            };
        }

        public static Actividad ToEntity(CreateActividadVO vo)
        {
            if (vo == null) return null!;

            return new Actividad
            {
                IdUser = vo.IdUser,
                Genero = vo.Genero,
                Actor = vo.Actor
            };
        }

        public static IEnumerable<ActividadVO> ToVOList(IEnumerable<Actividad> entities) => entities.Select(ToVO);
        public static IEnumerable<Actividad> ToEntityList(IEnumerable<ActividadVO> vos) => vos.Select(ToEntity);
    }
}
