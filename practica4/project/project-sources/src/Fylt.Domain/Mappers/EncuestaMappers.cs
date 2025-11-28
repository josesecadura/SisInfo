using Fylt.Domain.VOs.EncuestaVOs;
using Fylt.Infrastructure.DAOs;
using System.Collections.Generic;
using System.Linq;

namespace Fylt.Domain.Mappers
{
    internal static class EncuestaMappers
    {
        public static EncuestaVO ToVO(Encuesta entity)
        {
            if (entity == null) return null!;

            return new EncuestaVO
            {
                Id = entity.Id,
                IdAdmin = entity.IdAdmin,
                Fecha = entity.Fecha,
                Opcion1 = entity.Opcion1,
                Opcion2 = entity.Opcion2,
                Opcion3 = entity.Opcion3,
                Opcion4 = entity.Opcion4,
                Porcentaje1 = entity.Porcentaje1,
                Porcentaje2 = entity.Porcentaje2,
                Porcentaje3 = entity.Porcentaje3,
                Porcentaje4 = entity.Porcentaje4
            };
        }

        public static Encuesta ToEntity(EncuestaVO vo)
        {
            if (vo == null) return null!;

            return new Encuesta
            {
                Id = vo.Id,
                IdAdmin = vo.IdAdmin,
                Fecha = vo.Fecha,
                Opcion1 = vo.Opcion1,
                Opcion2 = vo.Opcion2,
                Opcion3 = vo.Opcion3,
                Opcion4 = vo.Opcion4,
                Porcentaje1 = vo.Porcentaje1,
                Porcentaje2 = vo.Porcentaje2,
                Porcentaje3 = vo.Porcentaje3,
                Porcentaje4 = vo.Porcentaje4
            };
        }

        public static Encuesta ToEntity(CreateEncuestaVO vo)
        {
            if (vo == null) return null!;

            return new Encuesta
            {
                IdAdmin = vo.IdAdmin,
                Fecha = vo.Fecha,
                Opcion1 = vo.Opcion1,
                Opcion2 = vo.Opcion2,
                Opcion3 = vo.Opcion3,
                Opcion4 = vo.Opcion4,
                Porcentaje1 = vo.Porcentaje1,
                Porcentaje2 = vo.Porcentaje2,
                Porcentaje3 = vo.Porcentaje3,
                Porcentaje4 = vo.Porcentaje4
            };
        }

        public static IEnumerable<EncuestaVO> ToVOList(IEnumerable<Encuesta> entities) => entities.Select(ToVO);
        public static IEnumerable<Encuesta> ToEntityList(IEnumerable<EncuestaVO> vos) => vos.Select(ToEntity);
    }
}
