namespace Fylt.Domain.VOs.RankingItemVO
{
    public class RankingItemVO
    {
        // L'Id est nécessaire pour la mise à jour/suppression de l'item spécifique
        public int Id { get; set; }

        // Clés étrangères pour la création
        public int IdRanking { get; set; }
        public int IdPelicula { get; set; }

        // Données du classement
        public int Posicion { get; set; }
        public float? Score { get; set; }
    }
}