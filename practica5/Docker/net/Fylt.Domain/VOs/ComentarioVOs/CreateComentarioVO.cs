namespace Fylt.Domain.VOs.ComentarioVOs
{
    public class CreateComentarioVO
    {
        public int IdUser { get; set; }
        public int IdPelicula { get; set; }
        public string? Descripcion { get; set; }
        public int NumLikes { get; set; } = 0;
        public bool Visible { get; set; } = false;
        public bool? Aprobado { get; set; } = null;
    }
}
