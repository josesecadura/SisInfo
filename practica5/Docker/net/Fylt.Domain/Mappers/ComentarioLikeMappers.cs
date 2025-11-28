using Fylt.Domain.VOs.ComentarioVOs;
using Fylt.Infrastructure.DAOs;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Fylt.Domain.Mappers
{
    public static class ComentarioLikeMappers
    {
        public static ComentarioLike ToEntity(CreateComentarioLikeVO vo)
            => new ComentarioLike
            {
                IdUser = vo.IdUser,
                IdComentario = vo.IdComentario,
                Fecha = DateTime.UtcNow
            };

        public static ComentarioLikeVO ToVO(ComentarioLike entity)
            => new ComentarioLikeVO
            {
                IdUser = entity.IdUser,
                IdComentario = entity.IdComentario,
                Fecha = entity.Fecha,
                Username = entity.Usuario?.Username
            };

        public static IEnumerable<ComentarioLikeVO> ToVOList(IEnumerable<ComentarioLike> list)
            => list?.Select(ToVO) ?? Enumerable.Empty<ComentarioLikeVO>();
    }
}