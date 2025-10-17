using Fylt.Domain.Mappers;
using Fylt.Domain.VOs.UsuariosVOs;
using Fylt.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.UsuariosService
{
    public class UsuariosService : IUsuariosService
    {
        private readonly FyltContext _fyltContext;
        private readonly ILogger<UsuariosService> _logger;

        public UsuariosService(FyltContext fyltContext, ILogger<UsuariosService> logger)
        {
            _fyltContext = fyltContext;
            _logger = logger;
        }

        public async Task<List<UsuarioVO>> GetAll()
        {
            var usuarios = await _fyltContext.Usuarios.AsNoTracking().ToListAsync();

            return UsuariosMappers.ToVOList(usuarios).ToList();
        }

        public async Task<int> CrearUsuarioAsync(CreateUsuarioVO vo)
        {
            var entity = UsuariosMappers.ToEntity(vo);
            _fyltContext.Usuarios.Add(entity);
            await _fyltContext.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateUsuarioAsync(UsuarioVO vo)
        {
            try
            {
                var existing = await _fyltContext.Usuarios.FirstOrDefaultAsync(x => x.Id == vo.Id);
                if (existing == null)
                {
                    _logger.LogWarning("Intento de actualización fallido. Usuario con ID {Id} no encontrado.", vo.Id);
                    return false;
                }

                existing.RealName = vo.RealName;
                existing.Username = vo.Username;
                existing.Descripcion = vo.Descripcion;
                existing.Seguidores = vo.Seguidores;
                existing.Seguidos = vo.Seguidos;
                existing.Foto = vo.Foto;
                existing.BoolAdmin = vo.BoolAdmin;

                _fyltContext.Usuarios.Update(existing);
                await _fyltContext.SaveChangesAsync();

                _logger.LogInformation("Usuario con ID {Id} actualizado correctamente.", vo.Id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar usuario con ID {Id}", vo.Id);
                return false;
            }
        }

        public async Task<bool> DeleteUsuarioAsync(int id)
        {
            try
            {
                var entity = await _fyltContext.Usuarios.FindAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Intento de eliminación fallido. Usuario con ID {Id} no encontrado.", id);
                    return false;
                }

                _fyltContext.Usuarios.Remove(entity);
                await _fyltContext.SaveChangesAsync();

                _logger.LogInformation("Usuario con ID {Id} eliminado correctamente.", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar usuario con ID {Id}", id);
                return false;
            }
        }
    }
}
