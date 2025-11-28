using Fylt.Domain.Mappers;
using Fylt.Domain.VOs.ComentarioVOs;
using Fylt.Domain.Utils; // <-- importar el moderador
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

            // Moderación automática
            bool aprobado = ComentarioModerador.EsAprobado(vo.Descripcion);
            entity.Aprobado = aprobado;
            entity.Visible = aprobado;

            _context.Comentarios.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }
        public async Task<ComentarioVO?> GetById(int id)
        {
            var c = await _context.Comentarios.FirstOrDefaultAsync(x => x.Id == id);
            if (c == null) return null;

            return new ComentarioVO
            {
                Id = c.Id,
                IdUser = c.IdUser,
                IdPelicula = c.IdPelicula,
                Descripcion = c.Descripcion,
                NumLikes = c.NumLikes,
                Visible = c.Visible,
                Aprobado = c.Aprobado
            };
        }
        public async Task<bool> UpdateComentarioAsync(ComentarioVO vo)
        {
            var entity = await _context.Comentarios.FirstOrDefaultAsync(c => c.Id == vo.Id);
            if (entity == null)
                return false;

            // Si alguna propiedad viene nula, conserva la anterior
            entity.Descripcion = vo.Descripcion ?? entity.Descripcion;
            entity.NumLikes = vo.NumLikes != 0 ? vo.NumLikes : entity.NumLikes;
            entity.Visible = vo.Visible ? vo.Visible : entity.Visible;
            entity.Aprobado = vo.Aprobado;

            _context.Comentarios.Update(entity);
            await _context.SaveChangesAsync();
            return true;
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
