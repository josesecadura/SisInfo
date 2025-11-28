using Fylt.Domain.Mappers;
using Fylt.Domain.VOs.ComentarioVOs;
using Fylt.Infrastructure.Context;
using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.ComentarioLikeService
{
    public class ComentarioLikeService : IComentarioLikeService
    {
        private readonly FyltContext _context;
        private readonly ILogger<ComentarioLikeService> _logger;

        public ComentarioLikeService(FyltContext context, ILogger<ComentarioLikeService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<ComentarioLikeVO>> GetLikesByComentarioIdAsync(int comentarioId)
        {
            var likes = await _context.Set<ComentarioLike>()
                .Where(l => l.IdComentario == comentarioId)
                .Include(l => l.Usuario)
                .AsNoTracking()
                .ToListAsync();

            return ComentarioLikeMappers.ToVOList(likes).ToList();
        }
        public async Task<IEnumerable<ComentarioVO>> GetLikedCommentsByUserAsync(int userId)
        {
            // Obtener los ids de comentario que el usuario ha marcado como like
            var comentarioIds = await _context.Set<ComentarioLike>()
                .Where(l => l.IdUser == userId)
                .Select(l => l.IdComentario)
                .ToListAsync();

            if (comentarioIds == null || !comentarioIds.Any())
            {
                return Enumerable.Empty<ComentarioVO>();
            }

            // Recuperar los comentarios completos y mapear a VO
            var comentarios = await _context.Comentarios
                .Where(c => comentarioIds.Contains(c.Id))
                .AsNoTracking()
                .ToListAsync();

            return ComentarioMappers.ToVOList(comentarios).ToList();
        }
        public async Task<bool> CrearComentarioLikeAsync(CreateComentarioLikeVO vo)
        {
            try
            {
                // Evitar insertar duplicados: comprobar existencia antes de insertar
                var exists = await _context.Set<ComentarioLike>()
                    .AnyAsync(l => l.IdUser == vo.IdUser && l.IdComentario == vo.IdComentario);

                if (exists)
                {
                    _logger.LogWarning("Intento de crear like duplicado: ComentarioId={ComentarioId}, UsuarioId={UserId}", vo.IdComentario, vo.IdUser);
                    return false; // ya existe, respetar la constraint UNIQUE
                }

                var entity = ComentarioLikeMappers.ToEntity(vo);
                _context.Set<ComentarioLike>().Add(entity);

                // +1 LIKE
                var comentario = await _context.Comentarios
                    .FirstOrDefaultAsync(c => c.Id == vo.IdComentario);

                if (comentario != null)
                {
                    comentario.NumLikes++;
                }

                _logger.LogInformation("Creando like: ComentarioId={ComentarioId}, UsuarioId={UserId}", vo.IdComentario, vo.IdUser);

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear like para comentario {ComentarioId} por usuario {UserId}", vo.IdComentario, vo.IdUser);
                throw;
            }
        }

        public async Task<bool> DeleteComentarioLikeAsync(int idUser, int idComentario)
        {
            try
            {
                var entity = await _context.Set<ComentarioLike>()
                    .FirstOrDefaultAsync(l => l.IdUser == idUser && l.IdComentario == idComentario);

                if (entity == null)
                    return false;

                _context.Set<ComentarioLike>().Remove(entity);

                var comentario = await _context.Comentarios
                    .FirstOrDefaultAsync(c => c.Id == idComentario);

                if (comentario != null && comentario.NumLikes > 0)
                {
                    comentario.NumLikes--;
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar like para comentario {ComentarioId} por usuario {UserId}", idComentario, idUser);
                return false;
            }
        }

        public Task<bool> ExistsAsync(int idUser, int idComentario)
        {
            return _context.Set<ComentarioLike>()
                .AnyAsync(l => l.IdUser == idUser && l.IdComentario == idComentario);
        }
    }
}