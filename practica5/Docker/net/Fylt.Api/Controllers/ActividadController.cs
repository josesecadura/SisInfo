// Fylt.Api.Controllers/ActividadController.cs
using Fylt.Contracts; // Para tu ApiResponseBase
using Fylt.Domain.Services.ActividadesService;
using Fylt.Domain.VOs.ActividadesVOs;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")] // Ruta base: /api/Actividad
public class ActividadController : ControllerBase
{
    private readonly IActividadService _actividadService;
    private readonly ILogger<ActividadController> _logger;

    public ActividadController(IActividadService actividadService, ILogger<ActividadController> logger)
    {
        _actividadService = actividadService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateActividadVO nuevaActividad)
    {
        if (!ModelState.IsValid)
            return BadRequest(ApiResponseBase.BadRequest(ModelState));

        try
        {
            await _actividadService.RegistrarActividadAsync(nuevaActividad);
            return StatusCode(201, ApiResponseBase.Ok(null, "Actividad registrada."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar actividad de tipo {Tipo}", nuevaActividad.TipoActividad);
            return StatusCode(500, ApiResponseBase.Fail("Error interno al registrar la actividad.", 500));
        }
    }

    [HttpGet("estadisticas")]
    [ProducesResponseType(typeof(ApiResponseBase), 200)]
    public async Task<IActionResult> GetStats([FromQuery] int days = 7)
    {
        try
        {
            var stats = await _actividadService.GetEstadisticasAdminAsync(days);
            return Ok(ApiResponseBase.Ok(stats, $"Estadísticas obtenidas para {days} días."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener estadísticas del dashboard");
            return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener estadísticas.", 500));
        }
    }
}