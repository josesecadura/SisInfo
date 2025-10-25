using Fylt.Domain.VOs.ActividadesVOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.ActividadesService
{
    public interface IActividadService
    {
        Task<List<ActividadVO>> GetAll();
        Task<int> CrearActividadAsync(CreateActividadVO vo);
        Task<bool> UpdateActividadAsync(ActividadVO vo);
        Task<bool> DeleteActividadAsync(int idUser);
    }
}
