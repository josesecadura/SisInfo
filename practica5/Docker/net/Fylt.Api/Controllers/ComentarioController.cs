using Fylt.Contracts;
using Fylt.Domain.Services.ComentarioService;
using Fylt.Domain.VOs.ComentarioVOs;
using Microsoft.AspNetCore.Mvc;

namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ComentarioController : ControllerBase
    {
        private readonly IComentarioService _comentarioService;
        private readonly ILogger<ComentarioController> _logger;

        public ComentarioController(IComentarioService comentarioService, ILogger<ComentarioController> logger)
        {
            _comentarioService = comentarioService;
            _logger = logger;
        }

        [HttpGet("comentarios")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            try
            {
                var comentarios = await _comentarioService.GetAll();
                if (comentarios == null || !comentarios.Any())
                    return NotFound(ApiResponseBase.NotFound("No se encontraron comentarios."));
                return Ok(ApiResponseBase.Ok(comentarios, "Comentarios obtenidos correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los comentarios");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener los comentarios.", 500));
            }
        }

        [HttpGet("comentarios/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct)
        {
            try
            {
                var all = await _comentarioService.GetAll();
                var comentario = all.FirstOrDefault(c => c.Id == id);
                if (comentario is null)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró el comentario con ID {id}."));
                return Ok(ApiResponseBase.Ok(comentario, "Comentario obtenido correctamente."));
            } 
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el comentario por ID");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener el comentario.", 500));
            }
        }

        [HttpPost("comentarios")]
        [ProducesResponseType(typeof(ApiResponseBase), 201)]
        [ProducesResponseType(typeof(ApiResponseBase), 409)]
        [ProducesResponseType(typeof(ApiResponseBase), 500)]
        public async Task<IActionResult> Create([FromBody] CreateComentarioVO nuevoComentario, CancellationToken ct)
        {
            try
            {
                var id = await _comentarioService.CrearComentarioAsync(nuevoComentario);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id },
                    ApiResponseBase.Ok(id, "Comentario creado correctamente.", 201)
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el comentario");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear el comentario.", 500));
            }
        }

        [HttpPut("comentarios/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 400)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] ComentarioVO comentario, CancellationToken ct)
        {
            try
            {
                var ok = await _comentarioService.UpdateComentarioAsync(comentario);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró el comentario para actualizar."));

                return Ok(ApiResponseBase.Ok(true, "Comentario actualizado correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el comentario");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al actualizar el comentario.", 500));
            }
        }

        [HttpDelete("comentarios/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken ct)
        {
            try
            {
                var ok = await _comentarioService.DeleteComentarioAsync(id);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró el comentario con ID {id} para eliminar."));
                return Ok(ApiResponseBase.Ok(true, "Comentario eliminado correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar el comentario");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al eliminar el comentario.", 500));
            }
        }
    }
}
