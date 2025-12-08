using Fylt.Domain.VOs.ActividadesVOs;
using Fylt.Infrastructure.DAOs;
using System;
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
                Id = entity.Id,
                IdUsuario = entity.IdUsuario ?? 0,
                TipoActividad = entity.TipoActividad,
                FechaAccion = entity.FechaAccion,
                Detalles = entity.Detalles
            };
        }

        public static Actividad ToEntity(ActividadVO vo)
        {
            if (vo == null) return null!;

            return new Actividad
            {
                Id = vo.Id,
                IdUsuario = vo.IdUsuario == 0 ? null : vo.IdUsuario,
                TipoActividad = vo.TipoActividad,
                FechaAccion = vo.FechaAccion,
                Detalles = vo.Detalles
            };
        }

        public static Actividad ToEntity(CreateActividadVO vo)
        {
            if (vo == null) return null!;

            return new Actividad
            {
                IdUsuario = vo.IdUsuario,
                TipoActividad = vo.TipoActividad ?? string.Empty,
                FechaAccion = vo.FechaAccion ?? DateTime.UtcNow,
                Detalles = vo.Detalles
            };
        }

        public static IEnumerable<ActividadVO> ToVOList(IEnumerable<Actividad> entities) => entities.Select(ToVO);
        public static IEnumerable<Actividad> ToEntityList(IEnumerable<ActividadVO> vos) => vos.Select(ToEntity);
    }
}