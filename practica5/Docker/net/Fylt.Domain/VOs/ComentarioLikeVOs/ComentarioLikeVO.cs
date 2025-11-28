using System;

namespace Fylt.Domain.VOs.ComentarioVOs
{
    public class ComentarioLikeVO
    {
        public int IdUser { get; set; }
        public int IdComentario { get; set; }
        public DateTime Fecha { get; set; }
        public string? Username { get; set; }
    }
}