using Fylt.Domain.VOs.ComentarioVOs;
using Fylt.Infrastructure.DAOs;

public static class ComentarioMappers
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
            NumLikes = entity.NumLikes,
            Visible = entity.Visible,
            Aprobado = entity.Aprobado
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
            NumLikes = vo.NumLikes,
            Visible = vo.Visible,
            Aprobado = vo.Aprobado
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
            NumLikes = vo.NumLikes,
            Visible = vo.Visible,
            Aprobado = vo.Aprobado
        };
    }

    public static IEnumerable<ComentarioVO> ToVOList(IEnumerable<Comentario> entities) => entities.Select(ToVO);
}
