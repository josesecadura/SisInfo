using Fylt.Domain.Mappers;
using Fylt.Domain.VOs.EncuestaVOs;
using Fylt.Infrastructure.Context;
using Fylt.Infrastructure.DAOs;
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

        public async Task<List<EncuestaVO>> GetActive()
        {
            var encuestas = await _context.Encuestas
                .Where(e => e.Activo)
                .AsNoTracking()
                .ToListAsync();

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
                existing.Pregunta = vo.Pregunta;
                existing.Fecha = vo.Fecha;
                existing.Opcion1 = vo.Opcion1;
                existing.Opcion2 = vo.Opcion2;
                existing.Opcion3 = vo.Opcion3;
                existing.Opcion4 = vo.Opcion4;
                existing.Porcentaje1 = vo.Porcentaje1;
                existing.Porcentaje2 = vo.Porcentaje2;
                existing.Porcentaje3 = vo.Porcentaje3;
                existing.Porcentaje4 = vo.Porcentaje4;
                existing.Activo = vo.Activo;
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

        public async Task<EncuestaVoto?> GetVotoUsuarioAsync(int idUser, int idEncuesta)
        {
            return await _context.EncuestaVotos
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.IdUser == idUser && v.IdEncuesta == idEncuesta);
        }

        public async Task<bool> VotarAsync(int idEncuesta, int idUser, int opcionVotada)
        {

            // Principio transaccion
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Verificar la existencia de la encuesta
                var encuesta = await _context.Encuestas
                    .FirstOrDefaultAsync(e => e.Id == idEncuesta);

                if (encuesta == null)
                    throw new Exception("Encuesta no encontrada.");

                // 2. Verificar que la opción votada sea válida
                bool opcionValida =
                    (opcionVotada == 1) ||
                    (opcionVotada == 2) ||
                    (opcionVotada == 3 && encuesta.Opcion3 != null && encuesta.Opcion3 != "") ||
                    (opcionVotada == 4 && encuesta.Opcion4 != null && encuesta.Opcion4 != "");

                if (!opcionValida)
                    throw new Exception("Opción inválida.");

                // 3. Verificar si el usuario ya ha votado
                var votoExistente = await _context.EncuestaVotos
                    .FirstOrDefaultAsync(v => v.IdUser == idUser && v.IdEncuesta == idEncuesta);

                if (votoExistente == null)
                {
                    // El usuario no ha votado → crear un nuevo voto
                    var nuevoVoto = new EncuestaVoto
                    {
                        IdUser = idUser,
                        IdEncuesta = idEncuesta,
                        OpcionVotada = opcionVotada
                    };

                    _context.EncuestaVotos.Add(nuevoVoto);
                }
                else
                {
                    // El usuario ya ha votado → actualizar su voto
                    votoExistente.OpcionVotada = opcionVotada;
                    _context.EncuestaVotos.Update(votoExistente);
                }

                await _context.SaveChangesAsync();

                // 4. Recalcular los porcentajes de votos

                var votos = await _context.EncuestaVotos
                    .Where(v => v.IdEncuesta == idEncuesta)
                    .ToListAsync();

                int total = votos.Count;

                if (total == 0)
                {
                    encuesta.Porcentaje1 = encuesta.Porcentaje2 = encuesta.Porcentaje3 = encuesta.Porcentaje4 = 0;
                }
                else
                {
                    encuesta.Porcentaje1 = (int)(votos.Count(v => v.OpcionVotada == 1) );
                    encuesta.Porcentaje2 = (int)(votos.Count(v => v.OpcionVotada == 2) );

                    encuesta.Porcentaje3 = encuesta.Opcion3 != null || encuesta.Opcion3 != ""
                        ? (int)(votos.Count(v => v.OpcionVotada == 3))
                        : 0;

                    encuesta.Porcentaje4 = encuesta.Opcion4 != null || encuesta.Opcion4 != ""
                        ? (int)(votos.Count(v => v.OpcionVotada == 4))
                        : 0;
                }

                if (encuesta.Fecha.HasValue)
                {
                    encuesta.Fecha = DateTime.SpecifyKind(encuesta.Fecha.Value, DateTimeKind.Utc);
                }

                // 5. Guardar los cambios en la encuesta
                _context.Encuestas.Update(encuesta);
                await _context.SaveChangesAsync();

                // 6. Commit de la transaccion
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


    }
}
