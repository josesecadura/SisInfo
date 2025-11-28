using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Domain.VOs.UsuariosVOs
{
    public class UsuarioVO
    {
        public int Id { get; set; }
        public string? RealName { get; set; }
        public string Username { get; set; } = null!;
        public string? Email { get; set; }
        public string? Descripcion { get; set; }
        public int Seguidores { get; set; } = 0;
        public int Seguidos { get; set; } = 0;
        public string? Foto { get; set; }
        public bool BoolAdmin { get; set; } = false;

    }
}
