using Fylt.Domain.VOs.EncuestaVOs;
using Fylt.Infrastructure.DAOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.EncuestaService
{
    public interface IEncuestaService
    {
        Task<List<EncuestaVO>> GetAll();
        Task<List<EncuestaVO>> GetActive();
        Task<int> CrearEncuestaAsync(CreateEncuestaVO vo);
        Task<bool> UpdateEncuestaAsync(EncuestaVO vo);
        Task<bool> DeleteEncuestaAsync(int id);
        Task<EncuestaVoto?> GetVotoUsuarioAsync(int idUser, int idEncuesta);
        Task<bool> VotarAsync(int idEncuesta, int idUser, int opcionVotada);
    }
}
