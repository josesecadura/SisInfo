namespace Fylt.Domain.VOs.UsuariosVOs
{
    public class CreateUsuarioVO
    {
        public string? RealName { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool BoolAdmin { get; set; } = false;

        // Campos opcionales con valores por defecto
        public string Descripcion { get; set; } = string.Empty;
        public int Seguidores { get; set; } = 0;
        public int Seguidos { get; set; } = 0;
        public string Foto { get; set; } = string.Empty;
    }
}