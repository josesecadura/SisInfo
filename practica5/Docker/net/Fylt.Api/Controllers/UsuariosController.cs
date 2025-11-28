using Fylt.Contracts;
using Fylt.Domain.Services.UsuariosService;
using Fylt.Domain.VOs.UsuariosVOs;
using Fylt.Infrastructure.DAOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
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
            try
            {
                var usuarios = await _usuarioService.GetAll();
                if (usuarios == null || !usuarios.Any())
                    return NotFound(ApiResponseBase.NotFound("No se encontraron usuarios."));
                return Ok(ApiResponseBase.Ok(usuarios, "Usuarios obtenidos correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los usuarios: {Message}", ex.Message);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener los usuarios.", 500));
            }
        }

        [HttpGet("users/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct)
        {
            try
            {
                var usuario = await _usuarioService.GetUserById(id);
                if (usuario is null)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró el usuario con ID {id}."));
                return Ok(ApiResponseBase.Ok(usuario, "Usuario obtenido correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener usuario por ID {Id}: {Message}", id, ex.Message);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener el usuario.", 500));
            }
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

                var token = await _usuarioService.GenerateAccessToken(usuarioCreado);
                var refreshToken = await _usuarioService.GenerateRefreshToken();

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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al crear usuario");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear el usuario.", 500));
            }
        }

        [HttpPut("users/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 400)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UsuarioVO usuario, CancellationToken ct)
        {
            try
            {
                if (id != usuario.Id)
                    return BadRequest(ApiResponseBase.BadRequest("El ID de la ruta no coincide con el del cuerpo."));

                var ok = await _usuarioService.UpdateUsuarioAsync(usuario);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró el usuario con ID {id} para actualizar."));
                return Ok(ApiResponseBase.Ok(true, "Usuario actualizado correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar usuario con ID {Id}: {Message}", id, ex.Message);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al actualizar el usuario.", 500));
            }
        }

        [HttpDelete("users/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken ct)
        {
            try
            {
                var ok = await _usuarioService.DeleteUsuarioAsync(id);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró el usuario con ID {id} para eliminar."));
                return Ok(ApiResponseBase.Ok(true, "Usuario eliminado correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar usuario con ID {Id}: {Message}", id, ex.Message);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al eliminar el usuario.", 500));
            }
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 401)]
        public async Task<IActionResult> Login([FromBody] LoginUsuarioVO login, CancellationToken ct)
        {
            try
            {
                var usuario = await _usuarioService.LoginAsync(login);

                if (usuario == null)
                    return Unauthorized(ApiResponseBase.Fail("Credenciales inválidas", 401));

                var token = await _usuarioService.GenerateAccessToken(usuario);
                var refreshToken = await _usuarioService.GenerateRefreshToken();

                // Coincide con AuthResponse del front
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al iniciar sesión");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al iniciar sesión.", 500));
            }
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                    return Unauthorized(ApiResponseBase.Fail("Token inválido", 401));

                var usuario = await _usuarioService.GetUserById(int.Parse(userId));
                if (usuario == null)
                    return NotFound(ApiResponseBase.Fail("Usuario no encontrado", 404));

                return Ok(ApiResponseBase.Ok(usuario));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el usuario actual: {Message}", ex.Message);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener el usuario actual.", 500));
            }
        }

        [HttpPut("users/{id:int}/password")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 400)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> ChangePassword([FromRoute] int id, [FromBody] PasswordVO data)
        {
            try
            {
                string oldPassword = data.OldPassword;
                string newPassword = data.NewPassword;

                if (string.IsNullOrWhiteSpace(oldPassword) || string.IsNullOrWhiteSpace(newPassword))
                    return BadRequest(ApiResponseBase.BadRequest("Debe enviar oldPassword y newPassword"));

                var ok = await _usuarioService.ChangePasswordAsync(id, oldPassword, newPassword);

                if (!ok)
                    return BadRequest(ApiResponseBase.BadRequest("La contraseña actual es incorrecta"));

                return Ok(ApiResponseBase.Ok(true, "Contraseña actualizada correctamente"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cambiar la contraseña del usuario {Id}: {Message}", id, ex.Message);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al cambiar la contraseña.", 500));
            }
        }
    }
}