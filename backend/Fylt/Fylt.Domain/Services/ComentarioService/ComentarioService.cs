using Fylt.Domain.Mappers;
using Fylt.Domain.VOs.ComentarioVOs;
using Fylt.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.ComentarioService
{
    public class ComentarioService : IComentarioService
    {
        private readonly FyltContext _context;
        private readonly ILogger<ComentarioService> _logger;

        public ComentarioService(FyltContext context, ILogger<ComentarioService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<ComentarioVO>> GetAll()
        {
            var comentarios = await _context.Comentarios.AsNoTracking().ToListAsync();
            return ComentarioMappers.ToVOList(comentarios).ToList();
        }

        public async Task<int> CrearComentarioAsync(CreateComentarioVO vo)
        {
            var entity = ComentarioMappers.ToEntity(vo);
            _context.Comentarios.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateComentarioAsync(ComentarioVO vo)
        {
            try
            {
                var existing = await _context.Comentarios.FirstOrDefaultAsync(x => x.Id == vo.Id);
                if (existing == null) return false;

                existing.Descripcion = vo.Descripcion;
                existing.NumLikes = vo.NumLikes;

                _context.Comentarios.Update(existing);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar comentario con ID {Id}", vo.Id);
                return false;
            }
        }

        public async Task<bool> DeleteComentarioAsync(int id)
        {
            try
            {
                var entity = await _context.Comentarios.FindAsync(id);
                if (entity == null) return false;

                _context.Comentarios.Remove(entity);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar comentario con ID {Id}", id);
                return false;
            }
        }
    }
}
