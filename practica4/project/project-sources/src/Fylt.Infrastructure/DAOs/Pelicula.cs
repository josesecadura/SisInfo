using System.ComponentModel.DataAnnotations.Schema;

namespace Fylt.Infrastructure.DAOs
{
    public class Pelicula
    {
        public int Id { get; set; }
        public int ExternalId { get; set; }
        public string? Titulo { get; set; }
        public string? Descripcion { get; set; }
        public DateTime? Fecha { get; set; }
        public string? Imagen { get; set; }
        public int? Valoracion { get; set; }


        [Column("generos", TypeName = "jsonb")]
        public string? Generos { get; set; }

        public List<Comentario>? Comentarios { get; set; }
        public List<ListaPelicula>? Listas { get; set; }
        public List<RankingItem>? RankingItems { get; set; }
    }
}
