using Fylt.Domain.VOs.ComentarioVOs;
using Fylt.Infrastructure.DAOs;
using System.Collections.Generic;
using System.Linq;

namespace Fylt.Domain.Mappers
{
    internal static class ComentarioMappers
    {
        public static ComentarioVO ToVO(Comentario entity)
        {
            if (entity == null) return null!;

            return new ComentarioVO
            {
                Id = entity.Id,
                IdUser = entity.IdUser,
                IdPelicula = entity.IdPelicula,
                Descripcion = entity.Descripcion,
                NumLikes = entity.NumLikes
            };
        }

        public static Comentario ToEntity(ComentarioVO vo)
        {
            if (vo == null) return null!;

            return new Comentario
            {
                Id = vo.Id,
                IdUser = vo.IdUser,
                IdPelicula = vo.IdPelicula,
                Descripcion = vo.Descripcion,
                NumLikes = vo.NumLikes
            };
        }

        public static Comentario ToEntity(CreateComentarioVO vo)
        {
            if (vo == null) return null!;

            return new Comentario
            {
                IdUser = vo.IdUser,
                IdPelicula = vo.IdPelicula,
                Descripcion = vo.Descripcion,
                NumLikes = vo.NumLikes
            };
        }

        public static IEnumerable<ComentarioVO> ToVOList(IEnumerable<Comentario> entities) => entities.Select(ToVO);
        public static IEnumerable<Comentario> ToEntityList(IEnumerable<ComentarioVO> vos) => vos.Select(ToEntity);
    }
}
