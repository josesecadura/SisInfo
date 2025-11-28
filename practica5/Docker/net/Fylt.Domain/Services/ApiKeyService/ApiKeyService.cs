using Fylt.Domain.Mappers;
using Fylt.Domain.VOs.ApiKeyVOs;
using Fylt.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.ApiKeyService
{
    public class ApiKeyService : IApiKeyService
    {
        private readonly FyltContext _context;
        private readonly ILogger<ApiKeyService> _logger;

        public ApiKeyService(FyltContext context, ILogger<ApiKeyService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<ApiKeyVO>> GetAll()
        {
            var keys = await _context.ApiKeys.AsNoTracking().ToListAsync();
            return ApiKeyMappers.ToVOList(keys).ToList();
        }

        public async Task<int> CrearApiKeyAsync(CreateApiKeyVO vo)
        {
            var entity = ApiKeyMappers.ToEntity(vo);
            _context.ApiKeys.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> UpdateApiKeyAsync(ApiKeyVO vo)
        {
            try
            {
                var existing = await _context.ApiKeys.FirstOrDefaultAsync(x => x.Id == vo.Id);
                if (existing == null) return false;

                existing.Direccion = vo.Direccion;
                existing.Nombre = vo.Nombre;

                _context.ApiKeys.Update(existing);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar ApiKey con ID {Id}", vo.Id);
                return false;
            }
        }

        public async Task<bool> DeleteApiKeyAsync(int id)
        {
            try
            {
                var entity = await _context.ApiKeys.FindAsync(id);
                if (entity == null) return false;

                _context.ApiKeys.Remove(entity);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar ApiKey con ID {Id}", id);
                return false;
            }
        }
    }
}
