using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Infrastructure.DAOs
{
    public class UsuarioSeguidor
    {
        public int IdUser { get; set; }
        public int IdAmigo { get; set; }

        public Usuario? Usuario { get; set; }
        public Usuario? Amigo { get; set; }
    }
}
