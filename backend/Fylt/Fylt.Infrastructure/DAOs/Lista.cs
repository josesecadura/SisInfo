using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Infrastructure.DAOs
{
    public class Lista
    {
        public int Id { get; set; }
        public string? Nombre { get; set; }
        public string? Imagen { get; set; }

        public List<UsuarioLista>? Usuarios { get; set; }
        public List<ListaPelicula>? Peliculas { get; set; }
    }
}
