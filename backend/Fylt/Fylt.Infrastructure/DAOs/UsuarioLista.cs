using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Infrastructure.DAOs
{
    public class UsuarioLista
    {
        public int IdUser { get; set; }
        public int IdLista { get; set; }

        public Usuario? Usuario { get; set; }
        public Lista? Lista { get; set; }
    }
}
