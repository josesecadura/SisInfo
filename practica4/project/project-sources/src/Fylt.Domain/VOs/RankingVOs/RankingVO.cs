namespace Fylt.Domain.VOs.RankingVO
{
    public class RankingVO
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = null!;
        public string? Descripcion { get; set; }
        public string Tipo { get; set; } = null!;
        public string? Periodo { get; set; }
        public DateTime? Fecha { get; set; }
    }
}