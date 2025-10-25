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
        public string? Descripcion { get; set; }
        public int Seguidores { get; set; } = 0;
        public int Seguidos { get; set; } = 0;
        public string? Foto { get; set; }
        public string Password { get; set; } = null!;
        public bool BoolAdmin { get; set; } = false;

        // Relaciones
        public List<Encuesta>? EncuestasCreadas { get; set; }
        public Actividad? Actividades { get; set; }
        public List<UsuarioLista>? UsuarioListas { get; set; }
        public List<UsuarioSeguidor>? SeguidoresUsuarios { get; set; }
    }
}
