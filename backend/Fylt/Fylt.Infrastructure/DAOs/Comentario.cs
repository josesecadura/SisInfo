using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Infrastructure.DAOs
{
    public class Comentario
    {
        public int Id { get; set; }
        public int IdUser { get; set; }
        public int IdPelicula { get; set; }
        public string? Descripcion { get; set; }
        public int NumLikes { get; set; } = 0;

        public Usuario? Usuario { get; set; }
        public Pelicula? Pelicula { get; set; }
    }
}
