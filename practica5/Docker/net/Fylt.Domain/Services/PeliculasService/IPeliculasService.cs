using Fylt.Domain.VOs.PeliculasVO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.PeliculasService
{
    public interface IPeliculasService
    {
        Task<List<PeliculaVO>> GetAllAsync();
        Task<PeliculaVO?> GetByIdAsync(int id);
        Task<bool> DeletePeliculaAsync(int id);
        Task<int> CreatePeliculaAsync(PeliculaVO peliculaVO);
        Task<bool> UpdatePeliculaAsync(PeliculaVO peliculaVO);
        Task<bool> ExistsByExternalIdAsync(int externalId);
        Task<string?> GetTrailerAsync(int peliculaId);
    }
}
