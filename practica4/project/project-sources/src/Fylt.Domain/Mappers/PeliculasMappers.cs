using Fylt.Domain.VOs.PeliculasVO;
using Fylt.Infrastructure.DAOs;
using System.Text.Json;

public static class PeliculasMappers
{
    public static PeliculaVO ToVO(Pelicula entity)
    {
        if (entity == null)
            return null!;

        return new PeliculaVO
        {
            Id = entity.Id,
            ExternalId = entity.ExternalId,
            Titulo = entity.Titulo,
            Descripcion = entity.Descripcion,
            Fecha = entity.Fecha,
            Imagen = entity.Imagen,
            Valoracion = entity.Valoracion,
            Generos = string.IsNullOrWhiteSpace(entity.Generos)
                ? null
                : JsonSerializer.Deserialize<List<string>>(entity.Generos)
        };
    }

    public static IEnumerable<PeliculaVO> ToVOList(IEnumerable<Pelicula> entities)
    {
        if (entities == null)
            return Enumerable.Empty<PeliculaVO>();

        return entities.Select(ToVO);
    }

    public static Pelicula ToEntity(PeliculaVO vo)
    {
        if (vo == null)
            return null!;

        return new Pelicula
        {
            Id = vo.Id,
            ExternalId = vo.ExternalId,
            Titulo = vo.Titulo,
            Descripcion = vo.Descripcion,
            Fecha = vo.Fecha.HasValue
                ? DateTime.SpecifyKind(vo.Fecha.Value, DateTimeKind.Utc)
                : null,
            Imagen = vo.Imagen,
            Valoracion = vo.Valoracion,

            // SERIALIZAR para guardarlo en un jsonb
            Generos = vo.Generos == null
                ? null
                : JsonSerializer.Serialize(vo.Generos)
        };
    }
}
