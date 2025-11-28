using Fylt.Domain.VOs.UsuariosVOs;
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
    }
}
