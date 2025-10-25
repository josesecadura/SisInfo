using Fylt.Contracts;
using Fylt.Domain.Services.EncuestaService;
using Fylt.Domain.VOs.EncuestaVOs;
using Microsoft.AspNetCore.Mvc;

namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class EncuestaController : ControllerBase
    {
        private readonly IEncuestaService _encuestaService;
        private readonly ILogger<EncuestaController> _logger;

        public EncuestaController(IEncuestaService encuestaService, ILogger<EncuestaController> logger)
        {
            _encuestaService = encuestaService;
            _logger = logger;
        }

        [HttpGet("encuestas")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var encuestas = await _encuestaService.GetAll();
            if (encuestas == null || !encuestas.Any())
                return NotFound(ApiResponseBase.NotFound("No se encontraron encuestas."));
            return Ok(ApiResponseBase.Ok(encuestas, "Encuestas obtenidas correctamente."));
        }

        [HttpGet("encuestas/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct)
        {
            var all = await _encuestaService.GetAll();
            var encuesta = all.FirstOrDefault(e => e.Id == id);
            if (encuesta is null)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la encuesta con ID {id}."));
            return Ok(ApiResponseBase.Ok(encuesta, "Encuesta obtenida correctamente."));
        }

        [HttpPost("encuestas")]
        [ProducesResponseType(typeof(ApiResponseBase), 201)]
        [ProducesResponseType(typeof(ApiResponseBase), 409)]
        [ProducesResponseType(typeof(ApiResponseBase), 500)]
        public async Task<IActionResult> Create([FromBody] CreateEncuestaVO nuevaEncuesta, CancellationToken ct)
        {
            try
            {
                var id = await _encuestaService.CrearEncuestaAsync(nuevaEncuesta);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id },
                    ApiResponseBase.Ok(id, "Encuesta creada correctamente.", 201)
                );
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear la encuesta.", 500));
            }
        }

        [HttpPut("encuestas/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 400)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] EncuestaVO encuesta, CancellationToken ct)
        {
            if (id != encuesta.Id)
                return BadRequest(ApiResponseBase.BadRequest("El ID de la ruta no coincide con el del cuerpo."));

            var ok = await _encuestaService.UpdateEncuestaAsync(encuesta);
            if (!ok)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la encuesta con ID {id} para actualizar."));
            return Ok(ApiResponseBase.Ok(true, "Encuesta actualizada correctamente."));
        }

        [HttpDelete("encuestas/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken ct)
        {
            var ok = await _encuestaService.DeleteEncuestaAsync(id);
            if (!ok)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la encuesta con ID {id} para eliminar."));
            return Ok(ApiResponseBase.Ok(true, "Encuesta eliminada correctamente."));
        }
    }
}
