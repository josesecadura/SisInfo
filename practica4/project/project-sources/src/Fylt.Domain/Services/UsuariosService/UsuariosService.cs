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
using BCrypt.Net;
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

        public async Task<UsuarioVO> CrearUsuarioAsync(CreateUsuarioVO vo)
        {
            if (await _fyltContext.Usuarios.AnyAsync(u => u.Username == vo.Username || 
                                                        u.Email ==  vo.Email))
            {
                _logger.LogWarning("Intento de creación fallido. El nombre de usuario {Username} ya existe.", vo.Username);
                throw new InvalidOperationException("El nombre de usuario o email ya existe.");
            }

            // Cifrado de la contraseña
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(vo.Password);
            vo.Password = hashedPassword;

            // Mapeamos el VO a la entidad Usuario
            var user = UsuariosMappers.ToEntity(vo);
            // Añadimos el nuevo user
            _fyltContext.Usuarios.Add(user);
            // Esperamos que se guarden los cambios de forma asíncrona en la bd
            await _fyltContext.SaveChangesAsync();
            return UsuariosMappers.ToVO(user);
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
        public async Task<UsuarioVO?> LoginAsync(LoginUsuarioVO login)
        {
            // 🔸 Si aún no usas email, cámbialo por Username
            var usuario = await _fyltContext.Usuarios
                .FirstOrDefaultAsync(u =>
                    (u.Email == login.Email));

            if (usuario == null)
                return null;

            // Contraseña emcriptada en bd
            bool passOk = BCrypt.Net.BCrypt.Verify(login.Password, usuario.Password);
            if (!passOk)
                return null;

            // Devuelve el VO del usuario autenticado
            return UsuariosMappers.ToVO(usuario);
        }
    }
}


