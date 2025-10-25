using Fylt.Domain.VOs.EncuestaVOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.EncuestaService
{
    public interface IEncuestaService
    {
        Task<List<EncuestaVO>> GetAll();
        Task<int> CrearEncuestaAsync(CreateEncuestaVO vo);
        Task<bool> UpdateEncuestaAsync(EncuestaVO vo);
        Task<bool> DeleteEncuestaAsync(int id);
    }
}
