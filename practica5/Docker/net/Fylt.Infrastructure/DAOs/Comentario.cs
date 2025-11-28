namespace Fylt.Infrastructure.DAOs
{
    public class Comentario
    {
        public int Id { get; set; }
        public int IdUser { get; set; }
        public int IdPelicula { get; set; }
        public string? Descripcion { get; set; }
        public int NumLikes { get; set; } = 0;
        public bool Visible { get; set; } = false;
        public bool? Aprobado { get; set; } = null; // null = pendiente, true = aprobado, false = rechazado

        public Usuario? Usuario { get; set; }
        public Pelicula? Pelicula { get; set; }
    }
}
