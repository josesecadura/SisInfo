using Fylt.Domain.VOs.ActividadesVOs;
using Fylt.Infrastructure.Context; 
using Fylt.Domain.Mappers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq;

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

        public async Task RegistrarActividadAsync(CreateActividadVO vo)
        {
            var entity = ActividadesMappers.ToEntity(vo);
            _context.Actividades.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<ActividadEstadisticaVO> GetEstadisticasAdminAsync(int days)
        {
            DateTime fechaInicio;
            if (days <= 0)
            {
                fechaInicio = new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            }
            else
            {

                fechaInicio = DateTime.UtcNow.AddDays(-days);
            }

            var logsDelPeriodo = await _context.Actividades
                .Where(a => a.FechaAccion >= fechaInicio)
                .AsNoTracking()
                .ToListAsync();


            var totalExitosos = logsDelPeriodo.Count(a => a.TipoActividad == "LOGIN_EXITOSO");
            var totalFallidos = logsDelPeriodo.Count(a => a.TipoActividad == "LOGIN_FALLIDO");
            var totalLogins = totalExitosos + totalFallidos;


            var tendenciaLogins = logsDelPeriodo
                .Where(a => a.TipoActividad == "LOGIN_EXITOSO")
                .GroupBy(a => a.FechaAccion.Date)
                .Select(g => new ActividadTrendData
                {
                    Etiqueta = g.Key.ToString("yyyy-MM-dd"),
                    Valor = g.Count()
                })
                .OrderBy(d => d.Etiqueta)
                .ToList();

            var tendenciaNuevosUsuarios = logsDelPeriodo
                .Where(a => a.TipoActividad == "USUARIO_REGISTRADO")
                .GroupBy(a => a.FechaAccion.Date)
                .Select(g => new ActividadTrendData
                {
                    Etiqueta = g.Key.ToString("yyyy-MM-dd"),
                    Valor = g.Count()
                })
                .OrderBy(d => d.Etiqueta)
                .ToList();

            var totalComentarios = await _context.Comentarios
                .CountAsync(c => c.FechaCreacion >= fechaInicio);

            var totalLikes = await _context.ComentarioLikes
                .CountAsync(cl => cl.Fecha >= fechaInicio);

            var totalNuevosUsuarios = logsDelPeriodo.Count(a => a.TipoActividad == "USUARIO_REGISTRADO");

            return new ActividadEstadisticaVO
            {
                TotalLoginsExitosos7Dias = totalExitosos,
                TotalLoginsFallidos7Dias = totalFallidos,
                TotalComentariosCreados7Dias = totalComentarios,
                TotalLikesComentarios7Dias = totalLikes,
                TotalNuevosUsuarios7Dias = totalNuevosUsuarios,

                RatioLoginExito = totalLogins > 0 ? (double)totalExitosos / totalLogins : 0.0,

                TendenciaLoginsExitosos7Dias = tendenciaLogins,
                TendenciaNuevosUsuarios7Dias = tendenciaNuevosUsuarios
            };
        }
    }
}