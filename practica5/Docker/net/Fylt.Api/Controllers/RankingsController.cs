using Fylt.Contracts;
using Fylt.Domain.Services.RankingsService;
using Fylt.Domain.VOs;
using Fylt.Domain.VOs.RankingVO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Threading.Tasks;

namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("[controller]")] // Route: /rankings
    public class RankingsController : ControllerBase
    {
        private readonly IRankingsService _rankingsService;
        private readonly ILogger<RankingsController> _logger;

        public RankingsController(IRankingsService rankingsService, ILogger<RankingsController> logger)
        {
            _rankingsService = rankingsService;
            _logger = logger;
        }

        // --- GET ALL ---
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var rankings = await _rankingsService.GetAllAsync();
                if (!rankings.Any())
                    return NotFound(ApiResponseBase.NotFound("No se encontraron rankings."));
                return Ok(ApiResponseBase.Ok(rankings, "Rankings obtenidos correctamente."));
            }catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al obtener rankings");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener los rankings.", 500));
            }
        }

        // --- GET BY ID ---
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                var ranking = await _rankingsService.GetByIdAsync(id);
                if (ranking is null)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró el ranking con ID {id}."));
                return Ok(ApiResponseBase.Ok(ranking, "Ranking obtenido correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al obtener ranking por ID {Id}", id);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener el ranking.", 500));
            }
        }

        // --- CREATE ---
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RankingVO nuevoRanking)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(nuevoRanking.Titulo) || string.IsNullOrWhiteSpace(nuevoRanking.Tipo))
                    return BadRequest(ApiResponseBase.BadRequest("Los campos 'Titulo' y 'Tipo' son obligatorios."));

                var id = await _rankingsService.CreateRankingAsync(nuevoRanking);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id },
                    ApiResponseBase.Ok(id, "Ranking creado correctamente.", 201)
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al crear ranking");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear el ranking.", 500));
            }
        }

        // --- UPDATE ---
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] RankingVO ranking)
        {
            try
            {
                if (id != ranking.Id)
                    return BadRequest(ApiResponseBase.BadRequest("El ID de la ruta no coincide con el del cuerpo."));
                if (string.IsNullOrWhiteSpace(ranking.Titulo) || string.IsNullOrWhiteSpace(ranking.Tipo))
                    return BadRequest(ApiResponseBase.BadRequest("Los campos 'Titulo' y 'Tipo' son obligatorios para la actualización."));

                var ok = await _rankingsService.UpdateRankingAsync(ranking);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró el ranking con ID {id} para actualizar."));
                return Ok(ApiResponseBase.Ok(true, "Ranking actualizado correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al actualizar ranking ID {Id}", id);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al actualizar el ranking.", 500));
            }
        }

        // --- DELETE ---
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            try
            {
                var ok = await _rankingsService.DeleteRankingAsync(id);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró el ranking con ID {id} para eliminar."));
                return Ok(ApiResponseBase.Ok(true, "Ranking eliminado correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al eliminar ranking ID {Id}", id);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al eliminar el ranking.", 500));
            }
        }

    }
}