using System;

namespace Fylt.Infrastructure.DAOs
{
    public class ComentarioLike
    {
        public int IdUser { get; set; }
        public int IdComentario { get; set; }
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        public Usuario? Usuario { get; set; }
        public Comentario? Comentario { get; set; }
    }
}