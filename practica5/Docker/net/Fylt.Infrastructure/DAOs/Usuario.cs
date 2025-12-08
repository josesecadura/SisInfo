using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Infrastructure.DAOs
{
    public class Usuario
    {
        public int Id { get; set; }
        public string? RealName { get; set; }
        public string Username { get; set; } = null!;
        public string? Email { get; set; }
        public string? Descripcion { get; set; }
        public int Seguidores { get; set; } = 0;
        public int Seguidos { get; set; } = 0;
        public string? Foto { get; set; }
        public string Password { get; set; } = null!;
        public bool BoolAdmin { get; set; } = false;

        // Relaciones
        public List<Encuesta>? EncuestasCreadas { get; set; }
        public ICollection<Actividad> Actividades { get; set; } = new List<Actividad>();
        public List<UsuarioLista>? UsuarioListas { get; set; }
        public ICollection<UsuarioSeguidor> SeguidosUsuarios { get; set; } = new List<UsuarioSeguidor>();
        public ICollection<UsuarioSeguidor> SeguidoresUsuarios { get; set; } = new List<UsuarioSeguidor>();
    }
}
