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
            try
            {
                var encuestas = await _encuestaService.GetAll();
                if (encuestas == null || !encuestas.Any())
                    return NotFound(ApiResponseBase.NotFound("No se encontraron encuestas."));
                return Ok(ApiResponseBase.Ok(encuestas, "Encuestas obtenidas correctamente."));
            } 
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todas las encuestas.");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener las encuestas.", 500));
            }
        }

        [HttpGet("encuestas/activas")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetAActive(CancellationToken ct)
        {
            try
            {
                var encuestas = await _encuestaService.GetActive();
                if (encuestas == null || !encuestas.Any())
                    return NotFound(ApiResponseBase.NotFound("No se encontraron encuestas."));
                return Ok(ApiResponseBase.Ok(encuestas, "Encuestas obtenidas correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todas las encuestas activas.");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener las encuestas.", 500));
            }
        }

        [HttpGet("encuestas/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct)
        {
            try
            {
                var all = await _encuestaService.GetAll();
                var encuesta = all.FirstOrDefault(e => e.Id == id);
                if (encuesta is null)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró la encuesta con ID {id}."));
                return Ok(ApiResponseBase.Ok(encuesta, "Encuesta obtenida correctamente."));
            } 
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener la encuesta con ID {id}.");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener la encuesta.", 500));
            }
        }

        [HttpPost("encuestas")]
        [ProducesResponseType(typeof(ApiResponseBase), 201)]
        [ProducesResponseType(typeof(ApiResponseBase), 409)]
        [ProducesResponseType(typeof(ApiResponseBase), 500)]
        public async Task<IActionResult> Create([FromBody] CreateEncuestaVO nuevaEncuesta, CancellationToken ct)
        {
            if (nuevaEncuesta == null || string.IsNullOrWhiteSpace(nuevaEncuesta.Pregunta))
                return BadRequest(ApiResponseBase.BadRequest("El campo 'Pregunta' es obligatorio."));

            try
            {
                var id = await _encuestaService.CrearEncuestaAsync(nuevaEncuesta);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id },
                    ApiResponseBase.Ok(id, "Encuesta creada correctamente.", 201)
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al crear encuesta.");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear la encuesta.", 500));
            }
        }

        [HttpPut("encuestas/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 400)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] EncuestaVO encuesta, CancellationToken ct)
        {
            try
            {
                if (id != encuesta.Id)
                    return BadRequest(ApiResponseBase.BadRequest("El ID de la ruta no coincide con el del cuerpo."));

                if (string.IsNullOrWhiteSpace(encuesta.Pregunta))
                    return BadRequest(ApiResponseBase.BadRequest("El campo 'Pregunta' es obligatorio."));

                var ok = await _encuestaService.UpdateEncuestaAsync(encuesta);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró la encuesta con ID {id} para actualizar."));
                return Ok(ApiResponseBase.Ok(true, "Encuesta actualizada correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar la encuesta con ID {id}.");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al actualizar la encuesta.", 500));
            }
        }

        [HttpDelete("encuestas/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken ct)
        {
            try
            {
                var ok = await _encuestaService.DeleteEncuestaAsync(id);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró la encuesta con ID {id} para eliminar."));
                return Ok(ApiResponseBase.Ok(true, "Encuesta eliminada correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar la encuesta con ID {id}.");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al eliminar la encuesta.", 500));
            }
        }

        [HttpGet("encuestas/{idEncuesta:int}/vote")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetVoto([FromRoute] int idEncuesta, int idUser, CancellationToken ct)
        {
            try
            {
                var voto = await _encuestaService.GetVotoUsuarioAsync(idUser, idEncuesta);
                if (voto is null)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró el voto del usuario {idUser} para la encuesta {idEncuesta}."));

                else 
                    return Ok(ApiResponseBase.Ok(voto.OpcionVotada, "El usuario ya ha votado."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el voto del usuario {idUser} para la encuesta {idEncuesta}.");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear la encuesta.", 500));
            }
        }


        [HttpPost("encuestas/{idEncuesta:int}/vote")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Votar([FromRoute] int idEncuesta, int idUser, int option, CancellationToken ct)
        {
            try
            {
                var all = await _encuestaService.GetAll();
                var encuesta = all.FirstOrDefault(e => e.Id == idEncuesta);
                if (encuesta is null)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró la encuesta con ID {idEncuesta} para votar."));
                var ok = await _encuestaService.VotarAsync(idEncuesta, idUser, option);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se pudo registrar el voto para la encuesta con ID {idEncuesta}."));
                return Ok(ApiResponseBase.Ok(true, "Voto registrado correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al registrar el voto para la encuesta con ID {idEncuesta}.");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear la encuesta.", 500));
            }
        }
    }
}
