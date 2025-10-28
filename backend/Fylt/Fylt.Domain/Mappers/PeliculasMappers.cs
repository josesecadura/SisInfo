using Fylt.Domain.VOs.PeliculasVO;
using Fylt.Infrastructure.DAOs;

namespace Fylt.Domain.Mappers
{
    public static class PeliculasMappers
    {
        public static PeliculaVO ToVO(Pelicula entity)
        {
            if (entity == null)
            {
                return null!; // Gère le cas où l'entité est null
            }

            return new PeliculaVO
            {
                Id = entity.Id,
                Titulo = entity.Titulo,
                Descripcion = entity.Descripcion,
                Imagen = entity.Imagen,
                Valoracion = entity.Valoracion
            };
        }

        /// <summary>
        /// Mappe une collection d'entités Pelicula vers une collection de PeliculaVO.
        /// </summary>
        /// <param name="entities">La collection d'entités Pelicula à mapper.</param>
        /// <returns>Une collection de PeliculaVO.</returns>
        public static IEnumerable<PeliculaVO> ToVOList(IEnumerable<Pelicula> entities)
        {
            if (entities == null)
            {
                return Enumerable.Empty<PeliculaVO>();
            }

            // Utilise LINQ pour appliquer la méthode ToVO à chaque élément
            return entities.Select(ToVO);
        }

        /// <summary>
        /// Mappe un Value Object (VO) PeliculaVO vers une entité Pelicula.
        /// </summary>
        /// <param name="vo">Le PeliculaVO à mapper.</param>
        /// <returns>L'entité Pelicula résultante.</returns>
        public static Pelicula ToEntity(PeliculaVO vo)
        {
            if (vo == null)
            {
                return null!; // Gère le cas où le VO est null
            }

            return new Pelicula
            {
                Id = vo.Id,
                Titulo = vo.Titulo,
                Descripcion = vo.Descripcion,
                Imagen = vo.Imagen,
                Valoracion = vo.Valoracion
            };
        }
    }
}