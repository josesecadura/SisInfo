using Fylt.Contracts;
using Fylt.Domain.Services.UsuarioSeguidorService;
using Fylt.Domain.VOs.UsuarioSeguidorVOs;
using Fylt.Domain.VOs.UsuariosVOs;
using Microsoft.AspNetCore.Mvc;

namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsuarioSeguidorController : ControllerBase
    {
        private readonly IUsuarioSeguidorService _service;
        private readonly ILogger<UsuarioSeguidorController> _logger;

        public UsuarioSeguidorController(
            IUsuarioSeguidorService service,
            ILogger<UsuarioSeguidorController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // ------------------------------------------------------------
        //  SEGUIR A UN USUARIO
        //  POST /UsuarioSeguidor/seguir
        // ------------------------------------------------------------
        [HttpPost("seguir")]
        public async Task<IActionResult> Seguir([FromBody] UsuarioSeguidorVO vo)
        {
            try
            {
                var ok = await _service.SeguirAsync(vo.IdUser, vo.IdAmigo);

                if (!ok)
                    return Conflict(ApiResponseBase.Fail("No se pudo seguir al usuario (ya lo sigues o no existe).", 409));

                return Ok(ApiResponseBase.Ok(true, "Ahora sigues a este usuario"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al intentar seguir al usuario {IdAmigo} por parte del usuario {IdUser}", vo.IdAmigo, vo.IdUser);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al intentar seguir al usuario.", 500));
            }
        }

        // ------------------------------------------------------------
        //  DEJAR DE SEGUIR
        //  DELETE /UsuarioSeguidor/{idUser}/{idAmigo}
        // ------------------------------------------------------------
        [HttpDelete("{idUser:int}/{idAmigo:int}")]
        public async Task<IActionResult> Unfollow([FromRoute] int idUser, [FromRoute] int idAmigo)
        {
            try
            {
                var ok = await _service.DejarDeSeguirAsync(idUser, idAmigo);

                if (!ok)
                    return NotFound(ApiResponseBase.NotFound("No se encontró la relación para eliminar."));

                return Ok(ApiResponseBase.Ok(true, "Has dejado de seguir a este usuario."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al intentar dejar de seguir al usuario {IdAmigo} por parte del usuario {IdUser}", idAmigo, idUser);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al intentar dejar de seguir al usuario.", 500));
            }
        }

        // ------------------------------------------------------------
        //  OBTENER LISTA DE A QUIÉN SIGO
        //  GET /UsuarioSeguidor/amigos/{idUser}
        // ------------------------------------------------------------
        [HttpGet("amigos/{idUser:int}")]
        public async Task<IActionResult> GetAmigos([FromRoute] int idUser)
        {
            try
            {
                var amigos = await _service.GetAmigosAsync(idUser);

                return Ok(ApiResponseBase.Ok(amigos, "Usuarios seguidos obtenidos correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la lista de amigos del usuario {IdUser}", idUser);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener la lista de amigos.", 500));
            }
        }

        // ------------------------------------------------------------
        //  BUSCAR USUARIOS POR USERNAME
        //  GET /UsuarioSeguidor/buscar?username=pepi
        // ------------------------------------------------------------
        [HttpGet("buscar")]
        public async Task<IActionResult> Search([FromQuery] string username)
        {
            try
            {
                var users = await _service.SearchUsersAsync(username);

                if (!users.Any())
                    return NotFound(ApiResponseBase.NotFound("No se encontraron usuarios con ese nombre."));

                return Ok(ApiResponseBase.Ok(users, "Usuarios encontrados."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al buscar usuarios con username similar a {Username}", username);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al buscar usuarios.", 500));
            }
        }
    }
}
