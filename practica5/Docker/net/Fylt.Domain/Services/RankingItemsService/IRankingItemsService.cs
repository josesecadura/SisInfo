using Fylt.Domain.VOs;
using Fylt.Domain.VOs.RankingItemVO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.RankingItemsService
{
    public interface IRankingItemsService
    {
        /// <summary>
        /// Ajoute un nouveau film à un classement (RankingItem).
        /// </summary>
        Task<int> CreateRankingItemAsync(RankingItemVO itemVO);

        /// <summary>
        /// Récupère tous les items (films et positions) pour un classement donné.
        /// </summary>
        Task<List<RankingItemVO>> GetItemsByRankingIdAsync(int rankingId);

        /// <summary>
        /// Met à jour la position ou le score d'un item de classement spécifique.
        /// </summary>
        Task<bool> UpdateRankingItemAsync(RankingItemVO itemVO);

        /// <summary>
        /// Supprime un item de classement spécifique par son Id (pas les entités Pelicula ou Ranking).
        /// </summary>
        Task<bool> DeleteRankingItemAsync(int itemId);

        Task<bool> RecalculatePositionsAsync(int rankingId);
    }
}