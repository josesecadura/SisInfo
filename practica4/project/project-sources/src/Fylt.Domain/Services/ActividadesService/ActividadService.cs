using Fylt.Domain.Mappers;
using Fylt.Domain.VOs.ActividadesVOs;
using Fylt.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.ActividadesService
{
    public class ActividadService : IActividadService
    {
        private readonly FyltContext _context;
        private readonly ILogger<ActividadService> _logger;

        public ActividadService(FyltContext context, ILogger<ActividadService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<ActividadVO>> GetAll()
        {
            var actividades = await _context.Actividades.AsNoTracking().ToListAsync();
            return ActividadesMappers.ToVOList(actividades).ToList();
        }

        public async Task<int> CrearActividadAsync(CreateActividadVO vo)
        {
            var entity = ActividadesMappers.ToEntity(vo);
            _context.Actividades.Add(entity);
            await _context.SaveChangesAsync();
            return entity.IdUser;
        }

        public async Task<bool> UpdateActividadAsync(ActividadVO vo)
        {
            try
            {
                var existing = await _context.Actividades.FirstOrDefaultAsync(x => x.IdUser == vo.IdUser);
                if (existing == null) return false;

                existing.Genero = vo.Genero;
                existing.Actor = vo.Actor;

                _context.Actividades.Update(existing);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar actividad con ID_USER {IdUser}", vo.IdUser);
                return false;
            }
        }

        public async Task<bool> DeleteActividadAsync(int idUser)
        {
            try
            {
                var entity = await _context.Actividades.FindAsync(idUser);
                if (entity == null) return false;

                _context.Actividades.Remove(entity);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar actividad con ID_USER {IdUser}", idUser);
                return false;
            }
        }
    }
}
