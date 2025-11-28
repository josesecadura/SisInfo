using Fylt.Domain.Mappers;
using Fylt.Domain.VOs.UsuariosVOs;
using Fylt.Infrastructure.Context;
using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.UsuarioSeguidorService
{
    internal class UsuarioSeguidorService : IUsuarioSeguidorService
    {
        private readonly FyltContext _fyltContext;
        private readonly ILogger<UsuarioSeguidorService> _logger;

        public UsuarioSeguidorService(FyltContext fyltContext, ILogger<UsuarioSeguidorService> logger)
        {
            _fyltContext = fyltContext;
            _logger = logger;
        }

        public async Task<bool> SeguirAsync(int idUser, int idAmigo)
        {
            if (idUser == idAmigo) return false;

            // Comprobar existencia previa
            var exists = await _fyltContext.UsuarioSeguidores
                .AnyAsync(x => x.IdUser == idUser && x.IdAmigo == idAmigo);

            if (exists) return false;

            // Comprobar que ambos usuarios existen
            var user = await _fyltContext.Usuarios.FindAsync(idUser);
            var amigo = await _fyltContext.Usuarios.FindAsync(idAmigo);
            if (user == null || amigo == null) return false;

            // Añadir relación y actualizar contadores
            _fyltContext.UsuarioSeguidores.Add(new UsuarioSeguidor
            {
                IdUser = idUser,
                IdAmigo = idAmigo
            });

            try
            {
                user.Seguidos++;
                amigo.Seguidores++;

                // Intento de guardar; en caso de race condition o duplicado manejamos la excepción
                await _fyltContext.SaveChangesAsync();
                _logger.LogInformation("Usuario {IdUser} ahora sigue a {IdAmigo}", idUser, idAmigo);
                return true;
            }
            catch (DbUpdateException dbEx)
            {
                // Puede ocurrir una violación de UNIQUE por race condition.
                // Re-comprobamos si finalmente existe la relación y devolvemos false en ese caso.
                var existsAfter = await _fyltContext.UsuarioSeguidores
                    .AnyAsync(x => x.IdUser == idUser && x.IdAmigo == idAmigo);

                if (existsAfter)
                {
                    _logger.LogWarning(dbEx, "Intento concurrente: la relación follow ya existe tras SaveChanges. {IdUser} -> {IdAmigo}", idUser, idAmigo);

                    // Asegurar contadores coherentes (opcional): recargar y normalizar
                    try
                    {
                        // refrescar contadores desde BD para evitar desincronía si fue otro request quien creó la relación
                        var refreshedUser = await _fyltContext.Usuarios.FindAsync(idUser);
                        var refreshedAmigo = await _fyltContext.Usuarios.FindAsync(idAmigo);
                        // No forzamos cambios aquí, solo intentamos evitar dejar excepciones no gestionadas
                    }
                    catch { /* ignorar refresco si falla */ }

                    return false;
                }

                _logger.LogError(dbEx, "DbUpdateException al crear follow {IdUser} -> {IdAmigo}", idUser, idAmigo);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al añadir follow: {IdUser} -> {IdAmigo}", idUser, idAmigo);
                throw;
            }
        }

        public async Task<bool> DejarDeSeguirAsync(int idUser, int idAmigo)
        {
            var entity = await _fyltContext.UsuarioSeguidores
                .FirstOrDefaultAsync(x => x.IdUser == idUser && x.IdAmigo == idAmigo);

            if (entity == null) return false;

            var user = await _fyltContext.Usuarios.FindAsync(idUser);
            var amigo = await _fyltContext.Usuarios.FindAsync(idAmigo);

            _fyltContext.UsuarioSeguidores.Remove(entity);

            try
            {
                if (user != null && user.Seguidos > 0) user.Seguidos--;
                if (amigo != null && amigo.Seguidores > 0) amigo.Seguidores--;
                await _fyltContext.SaveChangesAsync();
                _logger.LogInformation("Usuario {IdUser} dejó de seguir a {IdAmigo}", idUser, idAmigo);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar follow: {IdUser} -> {IdAmigo}", idUser, idAmigo);
                return false;
            }
        }

        public async Task<List<UsuarioVO>> GetAmigosAsync(int idUser)
        {
            var amigos = await _fyltContext.UsuarioSeguidores
                .Where(s => s.IdUser == idUser)
                .Include(s => s.Amigo)
                .AsNoTracking()
                .Select(s => s.Amigo!)
                .Where(a => a != null)
                .ToListAsync();

            return UsuariosMappers.ToVOList(amigos).ToList();
        }

        public async Task<List<UsuarioVO>> SearchUsersAsync(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return new List<UsuarioVO>();

            var q = username.Trim().ToLower();

            var users = await _fyltContext.Usuarios
                .AsNoTracking()
                .Where(u => u.Username.ToLower().Contains(q))
                .ToListAsync();

            return UsuariosMappers.ToVOList(users).ToList();
        }
    }
}