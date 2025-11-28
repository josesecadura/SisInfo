using Fylt.Domain.VOs.UsuariosVOs;
using Fylt.Infrastructure.DAOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.UsuariosService
{
    public interface IUsuariosService
    {
        Task<List<UsuarioVO>> GetAll();
        Task<UsuarioVO> CrearUsuarioAsync(CreateUsuarioVO vo);
        Task<bool> UpdateUsuarioAsync(UsuarioVO vo);
        Task<bool> DeleteUsuarioAsync(int id);
        Task<UsuarioVO?> LoginAsync(LoginUsuarioVO login);
        Task<string> GenerateAccessToken(UsuarioVO usuario);
        Task<string> GenerateRefreshToken();

        // Para recuperar un usuario mediante su id
        Task<UsuarioVO> GetUserById(int id);
        Task<bool> ChangePasswordAsync(int id, string oldPassword, string newPassword);

    }
}
