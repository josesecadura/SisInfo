using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Infrastructure.DAOs
{
    public class ListaPelicula
    {
        public int IdLista { get; set; }
        public int IdPelicula { get; set; }

        public Lista? Lista { get; set; }
        public Pelicula? Pelicula { get; set; }
    }
}
