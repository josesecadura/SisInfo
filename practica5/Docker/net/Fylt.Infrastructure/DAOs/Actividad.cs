using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Infrastructure.DAOs
{
    public class Actividad
    {
        public int IdUser { get; set; }
        public string? Genero { get; set; }
        public string? Actor { get; set; }

        public Usuario? Usuario { get; set; }
    }
}
