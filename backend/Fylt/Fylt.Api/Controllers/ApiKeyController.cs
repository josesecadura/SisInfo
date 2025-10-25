using Fylt.Contracts;
using Fylt.Domain.Services.ApiKeyService;
using Fylt.Domain.VOs.ApiKeyVOs;
using Microsoft.AspNetCore.Mvc;

namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ApiKeyController : ControllerBase
    {
        private readonly IApiKeyService _apiKeyService;
        private readonly ILogger<ApiKeyController> _logger;

        public ApiKeyController(IApiKeyService apiKeyService, ILogger<ApiKeyController> logger)
        {
            _apiKeyService = apiKeyService;
            _logger = logger;
        }

        [HttpGet("apikeys")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var apikeys = await _apiKeyService.GetAll();
            if (apikeys == null || !apikeys.Any())
                return NotFound(ApiResponseBase.NotFound("No se encontraron API keys."));
            return Ok(ApiResponseBase.Ok(apikeys, "API keys obtenidas correctamente."));
        }

        [HttpGet("apikeys/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct)
        {
            var all = await _apiKeyService.GetAll();
            var key = all.FirstOrDefault(a => a.Id == id);
            if (key is null)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la API key con ID {id}."));
            return Ok(ApiResponseBase.Ok(key, "API key obtenida correctamente."));
        }

        [HttpPost("apikeys")]
        [ProducesResponseType(typeof(ApiResponseBase), 201)]
        [ProducesResponseType(typeof(ApiResponseBase), 409)]
        [ProducesResponseType(typeof(ApiResponseBase), 500)]
        public async Task<IActionResult> Create([FromBody] CreateApiKeyVO nuevaKey, CancellationToken ct)
        {
            try
            {
                var id = await _apiKeyService.CrearApiKeyAsync(nuevaKey);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id },
                    ApiResponseBase.Ok(id, "API key creada correctamente.", 201)
                );
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear la API key.", 500));
            }
        }

        [HttpPut("apikeys/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 400)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] ApiKeyVO key, CancellationToken ct)
        {
            if (id != key.Id)
                return BadRequest(ApiResponseBase.BadRequest("El ID de la ruta no coincide con el del cuerpo."));

            var ok = await _apiKeyService.UpdateApiKeyAsync(key);
            if (!ok)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la API key con ID {id} para actualizar."));
            return Ok(ApiResponseBase.Ok(true, "API key actualizada correctamente."));
        }

        [HttpDelete("apikeys/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken ct)
        {
            var ok = await _apiKeyService.DeleteApiKeyAsync(id);
            if (!ok)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la API key con ID {id} para eliminar."));
            return Ok(ApiResponseBase.Ok(true, "API key eliminada correctamente."));
        }
    }
}
