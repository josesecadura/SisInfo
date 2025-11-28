using Fylt.Domain.VOs;
using Fylt.Domain.VOs.ListasVO;
using Fylt.Domain.VOs.PeliculasVO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.ListasService
{
    public interface IListasService
    {
        // CRUD de base
        Task<int> CreateListaAsync(ListaVO listaVO);
        Task<List<ListaVO>> GetAllAsync();
        Task<ListaVO?> GetByIdAsync(int id);
        Task<bool> UpdateListaAsync(ListaVO listaVO);
        Task<bool> DeleteListaAsync(int id);

        // Gestion des relations (exemples)
        Task<bool> AddPeliculaToListaAsync(int listaId, int peliculaId);
        Task<bool> RemovePeliculaFromListaAsync(int listaId, int peliculaId);
        Task<List<PeliculaVO>> GetPeliculasByListaIdAsync(int listaId);
        Task<int> CreateListaConUsuario(ListaVO list, int userId);
        Task<List<ListaVO>> GetListasByUsuarioIdAsync(int usuarioId);
    }
}