

namespace Fylt.Domain.VOs.PeliculasVO
{
    public class PeliculaVO
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = null!;
        public string? Descripcion { get; set; }
        public string? Imagen { get; set; }
        public int? Valoracion { get; set; }
        
    }

}

