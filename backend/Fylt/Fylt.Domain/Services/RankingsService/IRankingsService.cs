using Fylt.Domain.VOs;
using Fylt.Domain.VOs.RankingVO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.RankingsService
{
    public interface IRankingsService
    {
        // CRUD de base
        Task<int> CreateRankingAsync(RankingVO rankingVO);
        Task<List<RankingVO>> GetAllAsync();
        Task<RankingVO?> GetByIdAsync(int id);
        Task<bool> UpdateRankingAsync(RankingVO rankingVO);
        Task<bool> DeleteRankingAsync(int id);
    }
}