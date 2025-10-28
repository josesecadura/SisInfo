using Fylt.Domain.VOs.ListasVO;
using Fylt.Infrastructure.DAOs;
using System.Collections.Generic;
using System.Linq;

namespace Fylt.Domain.Mappers
{
    public static class ListasMappers
    {
        public static ListaVO ToVO(Lista entity)
        {
            if (entity == null) return null!;
            return new ListaVO
            {
                Id = entity.Id,
                Nombre = entity.Nombre,
                Imagen = entity.Imagen
            };
        }

        public static IEnumerable<ListaVO> ToVOList(IEnumerable<Lista> entities)
        {
            if (entities == null) return Enumerable.Empty<ListaVO>();
            return entities.Select(ToVO);
        }

        public static Lista ToEntity(ListaVO vo)
        {
            if (vo == null) return null!;
            return new Lista
            {
                Id = vo.Id,
                Nombre = vo.Nombre,
                Imagen = vo.Imagen
            };
        }
    }
}