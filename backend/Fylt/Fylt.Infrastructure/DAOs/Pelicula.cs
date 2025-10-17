using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Infrastructure.DAOs
{
    public class Pelicula
    {
        public int Id { get; set; }
        public string? Titulo { get; set; }
        public string? Descripcion { get; set; }
        public string? Imagen { get; set; }
        public int? Valoracion { get; set; }

        public List<Comentario>? Comentarios { get; set; }
        public List<ListaPelicula>? Listas { get; set; }
        public List<RankingItem>? RankingItems { get; set; }
    }
}
