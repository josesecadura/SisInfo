using Fylt.Domain.VOs.ActividadesVOs;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.ActividadesService
{
    public interface IActividadService
    {
        Task RegistrarActividadAsync(CreateActividadVO vo);
        Task<ActividadEstadisticaVO> GetEstadisticasAdminAsync(int days);
    }
}