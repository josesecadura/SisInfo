using Fylt.Contracts;
using Fylt.Domain.Services.UsuariosService;
using Fylt.Domain.VOs.UsuariosVOs;
using Microsoft.AspNetCore.Mvc;

namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuariosService _usuarioService; // Servicio inyectado para manejar la lógica de usuarios
        private readonly ILogger<UsuariosController> _logger; // Logger para registrar eventos y errores

        public UsuariosController(IUsuariosService usuariosService, ILogger<UsuariosController> logger) // Constructor del controlador (con inyección de dependencias)
        {
            _usuarioService = usuariosService;
            _logger = logger;
        }

        // Métodos CRUD para usuarios
        [HttpGet("users")] // ruta: GET /usuarios/users
        [ProducesResponseType(typeof(ApiResponseBase), 200)] // Indica que la respuesta exitosa devolverá un ApiResponseBase
        [ProducesResponseType(typeof(ApiResponseBase), 404)] // Indica que la respuesta error devolverá un ApiResponseBase
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
                var usuarioCreado = await _usuarioService.CrearUsuarioAsync(nuevoUsuario);

                // mock tokens
                var token = Guid.NewGuid().ToString();
                var refreshToken = Guid.NewGuid().ToString();

                var authResponse = new
                {
                    token,
                    refreshToken,
                    user = new
                    {
                        id = usuarioCreado.Id,
                        username = usuarioCreado.Username,
                        email = usuarioCreado.Email,
                        role = usuarioCreado.BoolAdmin ? "admin" : "user"
                    }
                };

                _logger.LogInformation("Usuario creado correctamente. ID={Id} Username={Username}", usuarioCreado.Id, usuarioCreado.Username);

                // Devuelve 201 Created con Location apuntando a GetById
                return CreatedAtAction(nameof(GetById), new { id = usuarioCreado.Id }, ApiResponseBase.Ok(authResponse, "Usuario creado correctamente"));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ApiResponseBase.Fail(ex.Message, 409));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al crear usuario");
                Console.WriteLine("🔥 EXCEPCIÓN DETALLADA: " + ex);
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

        [HttpPost("login")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 401)]
        public async Task<IActionResult> Login([FromBody] LoginUsuarioVO login, CancellationToken ct)
        {
            var usuario = await _usuarioService.LoginAsync(login);

            if (usuario == null)
                return Unauthorized(ApiResponseBase.Fail("Credenciales inválidas", 401));

            // Tokens mock (a futuro los reemplazas por JWT reales)
            var token = Guid.NewGuid().ToString();
            var refreshToken = Guid.NewGuid().ToString();

            // ✅ Coincide con AuthResponse del front
            var authResponse = new
            {
                token = token,
                refreshToken = refreshToken,
                user = new
                {
                    id = usuario.Id.ToString(),
                    username = usuario.Username,
                    email = usuario.Email,
                    role = usuario.BoolAdmin ? "admin" : "user"
                }
            };

            return Ok(ApiResponseBase.Ok(authResponse, "Inicio de sesión correcto"));
        }
    }
}