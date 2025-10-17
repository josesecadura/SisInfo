using Fylt.Contracts;
using Fylt.Domain.Services.UsuariosService;
using Fylt.Domain.VOs.UsuariosVOs;
using Microsoft.AspNetCore.Mvc;

namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuariosService _usuarioService;
        private readonly ILogger<UsuariosController> _logger;

        public UsuariosController(IUsuariosService usuariosService, ILogger<UsuariosController> logger)
        {
            _usuarioService = usuariosService;
            _logger = logger;
        }

        [HttpGet("users")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var usuarios = await _usuarioService.GetAll();
            if (usuarios == null || !usuarios.Any())
                return NotFound(ApiResponseBase.NotFound("No se encontraron usuarios."));
            return Ok(ApiResponseBase.Ok(usuarios, "Usuarios obtenidos correctamente."));
        }

        [HttpGet("users/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct)
        {
            var all = await _usuarioService.GetAll();
            var usuario = all.FirstOrDefault(u => u.Id == id);
            if (usuario is null)
                return NotFound(ApiResponseBase.NotFound($"No se encontró el usuario con ID {id}."));
            return Ok(ApiResponseBase.Ok(usuario, "Usuario obtenido correctamente."));
        }

        [HttpPost("users")]
        [ProducesResponseType(typeof(ApiResponseBase), 201)]
        [ProducesResponseType(typeof(ApiResponseBase), 409)]
        [ProducesResponseType(typeof(ApiResponseBase), 500)]
        public async Task<IActionResult> Create([FromBody] CreateUsuarioVO nuevoUsuario, CancellationToken ct)
        {
            try
            {
                var id = await _usuarioService.CrearUsuarioAsync(nuevoUsuario);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id },
                    ApiResponseBase.Ok(id, "Usuario creado correctamente.", 201)
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ApiResponseBase.Fail(ex.Message, 409));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear el usuario.", 500));
            }
        }

        [HttpPut("users/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 400)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UsuarioVO usuario, CancellationToken ct)
        {
            if (id != usuario.Id)
                return BadRequest(ApiResponseBase.BadRequest("El ID de la ruta no coincide con el del cuerpo."));

            var ok = await _usuarioService.UpdateUsuarioAsync(usuario);
            if (!ok)
                return NotFound(ApiResponseBase.NotFound($"No se encontró el usuario con ID {id} para actualizar."));
            return Ok(ApiResponseBase.Ok(true, "Usuario actualizado correctamente."));
        }

        [HttpDelete("users/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken ct)
        {
            var ok = await _usuarioService.DeleteUsuarioAsync(id);
            if (!ok)
                return NotFound(ApiResponseBase.NotFound($"No se encontró el usuario con ID {id} para eliminar."));
            return Ok(ApiResponseBase.Ok(true, "Usuario eliminado correctamente."));
        }
    }
}
