using Fylt.Domain.VOs.UsuariosVOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.UsuarioSeguidorService
{
    public interface IUsuarioSeguidorService
    {
        Task<bool> SeguirAsync(int idUser, int idAmigo);
        Task<bool> DejarDeSeguirAsync(int idUser, int idAmigo);
        Task<List<UsuarioVO>> GetAmigosAsync(int idUser);
        Task<List<UsuarioVO>> SearchUsersAsync(string username);
    }
}
