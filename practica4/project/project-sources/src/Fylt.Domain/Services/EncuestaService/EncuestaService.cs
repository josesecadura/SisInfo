using Fylt.Domain.Mappers;
using Fylt.Domain.VOs.EncuestaVOs;
using Fylt.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.EncuestaService
{
    public class EncuestaService : IEncuestaService
    {
        private readonly FyltContext _context;
        private readonly ILogger<EncuestaService> _logger;

        public EncuestaService(FyltContext context, ILogger<EncuestaService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<EncuestaVO>> GetAll()
        {
            var encuestas = await _context.Encuestas.AsNoTracking().ToListAsync();
            return EncuestaMappers.ToVOList(encuestas).ToList();
        }

        public async Task<int> CrearEncuestaAsync(CreateEncuestaVO vo)
        {
            var entity = EncuestaMappers.ToEntity(vo);
            _context.Encuestas.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateEncuestaAsync(EncuestaVO vo)
        {
            try
            {
                var existing = await _context.Encuestas.FirstOrDefaultAsync(x => x.Id == vo.Id);
                if (existing == null) return false;

                existing.Fecha = vo.Fecha;
                existing.Opcion1 = vo.Opcion1;
                existing.Opcion2 = vo.Opcion2;
                existing.Opcion3 = vo.Opcion3;
                existing.Opcion4 = vo.Opcion4;
                existing.Porcentaje1 = vo.Porcentaje1;
                existing.Porcentaje2 = vo.Porcentaje2;
                existing.Porcentaje3 = vo.Porcentaje3;
                existing.Porcentaje4 = vo.Porcentaje4;

                _context.Encuestas.Update(existing);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar encuesta con ID {Id}", vo.Id);
                return false;
            }
        }

        public async Task<bool> DeleteEncuestaAsync(int id)
        {
            try
            {
                var entity = await _context.Encuestas.FindAsync(id);
                if (entity == null) return false;

                _context.Encuestas.Remove(entity);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar encuesta con ID {Id}", id);
                return false;
            }
        }
    }
}
