using Fylt.Contracts;
using Fylt.Domain.Services.ActividadesService;
using Fylt.Domain.VOs.ActividadesVOs;
using Microsoft.AspNetCore.Mvc;

namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ActividadController : ControllerBase
    {
        private readonly IActividadService _actividadService;
        private readonly ILogger<ActividadController> _logger;

        public ActividadController(IActividadService actividadService, ILogger<ActividadController> logger)
        {
            _actividadService = actividadService;
            _logger = logger;
        }

        [HttpGet("actividades")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var actividades = await _actividadService.GetAll();
            if (actividades == null || !actividades.Any())
                return NotFound(ApiResponseBase.NotFound("No se encontraron actividades."));
            return Ok(ApiResponseBase.Ok(actividades, "Actividades obtenidas correctamente."));
        }

        [HttpGet("actividades/{idUser:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetById([FromRoute] int idUser, CancellationToken ct)
        {
            var all = await _actividadService.GetAll();
            var actividad = all.FirstOrDefault(a => a.IdUser == idUser);
            if (actividad is null)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la actividad con ID_USER {idUser}."));
            return Ok(ApiResponseBase.Ok(actividad, "Actividad obtenida correctamente."));
        }

        [HttpPost("actividades")]
        [ProducesResponseType(typeof(ApiResponseBase), 201)]
        [ProducesResponseType(typeof(ApiResponseBase), 409)]
        [ProducesResponseType(typeof(ApiResponseBase), 500)]
        public async Task<IActionResult> Create([FromBody] CreateActividadVO nuevaActividad, CancellationToken ct)
        {
            try
            {
                var id = await _actividadService.CrearActividadAsync(nuevaActividad);
                return CreatedAtAction(
                    nameof(GetById),
                    new { idUser = id },
                    ApiResponseBase.Ok(id, "Actividad creada correctamente.", 201)
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ApiResponseBase.Fail(ex.Message, 409));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear la actividad.", 500));
            }
        }

        [HttpPut("actividades/{idUser:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 400)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Update([FromRoute] int idUser, [FromBody] ActividadVO actividad, CancellationToken ct)
        {
            if (idUser != actividad.IdUser)
                return BadRequest(ApiResponseBase.BadRequest("El ID de la ruta no coincide con el del cuerpo."));

            var ok = await _actividadService.UpdateActividadAsync(actividad);
            if (!ok)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la actividad con ID_USER {idUser} para actualizar."));
            return Ok(ApiResponseBase.Ok(true, "Actividad actualizada correctamente."));
        }

        [HttpDelete("actividades/{idUser:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Delete([FromRoute] int idUser, CancellationToken ct)
        {
            var ok = await _actividadService.DeleteActividadAsync(idUser);
            if (!ok)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la actividad con ID_USER {idUser} para eliminar."));
            return Ok(ApiResponseBase.Ok(true, "Actividad eliminada correctamente."));
        }
    }
}
