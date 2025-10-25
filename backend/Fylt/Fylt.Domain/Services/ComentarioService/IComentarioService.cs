using Fylt.Domain.VOs.ComentarioVOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.ComentarioService
{
    public interface IComentarioService
    {
        Task<List<ComentarioVO>> GetAll();
        Task<int> CrearComentarioAsync(CreateComentarioVO vo);
        Task<bool> UpdateComentarioAsync(ComentarioVO vo);
        Task<bool> DeleteComentarioAsync(int id);
    }
}
