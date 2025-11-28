using Fylt.Domain.VOs.ComentarioVOs;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.ComentarioLikeService
{
    public interface IComentarioLikeService
    {
        Task<List<ComentarioLikeVO>> GetLikesByComentarioIdAsync(int comentarioId);
        Task<IEnumerable<ComentarioVO>> GetLikedCommentsByUserAsync(int userId);
        Task<bool> CrearComentarioLikeAsync(CreateComentarioLikeVO vo);
        Task<bool> DeleteComentarioLikeAsync(int idUser, int idComentario);
        Task<bool> ExistsAsync(int idUser, int idComentario);
    }
}