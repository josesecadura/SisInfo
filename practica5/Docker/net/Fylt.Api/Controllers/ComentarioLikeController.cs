using Fylt.Api.ApiModels;
using Fylt.Contracts;
using Fylt.Domain.Services.ComentarioLikeService;
using Fylt.Domain.VOs.ComentarioVOs;
using Microsoft.AspNetCore.Mvc;

namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ComentarioLikeController : ControllerBase
    {
        private readonly IComentarioLikeService _likeService;
        private readonly ILogger<ComentarioLikeController> _logger;

        public ComentarioLikeController(IComentarioLikeService likeService, ILogger<ComentarioLikeController> logger)
        {
            _likeService = likeService;
            _logger = logger;
        }

        [HttpGet("comentario/{id:int}")]
        public async Task<IActionResult> GetByComentario([FromRoute] int id)
        {
            try
            {
                var likes = await _likeService.GetLikesByComentarioIdAsync(id);
                return Ok(ApiResponseBase.Ok(likes, "Likes del comentario obtenidos."));
            } 
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo likes para el comentario {ComentarioId}", id);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener likes del comentario.", 500));
            }
        }

        [HttpGet("comentario/exists/{comentarioId:int}/{userId:int}")]
        public async Task<IActionResult> Exists([FromRoute] int comentarioId, [FromRoute] int userId)
        {
            try
            {
                var exists = await _likeService.ExistsAsync(userId, comentarioId);
                _logger.LogInformation("Comprobación like: ComentarioId={ComentarioId}, UsuarioId={UserId}, Exists={Exists}", comentarioId, userId, exists);
                return Ok(ApiResponseBase.Ok(exists, exists ? "El like existe." : "No existe like para este usuario y comentario."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error comprobando existencia de like para ComentarioId={ComentarioId} y UsuarioId={UserId}", comentarioId, userId);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al comprobar existencia del like.", 500));
            }
        }

        [HttpPost("comentario/like")]
        public async Task<IActionResult> Create([FromBody] CreateComentarioLikeVO vo)
        {
            try
            {
                var created = await _likeService.CrearComentarioLikeAsync(vo);
                if (!created)
                    return Conflict(ApiResponseBase.Fail("El like ya existe.", 409));

                return Created("", ApiResponseBase.Ok(true, "Like creado correctamente.", 201));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando like para ComentarioId={ComentarioId} y UsuarioId={UserId}", vo.IdComentario, vo.IdUser);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear el like.", 500));
            }
        }

        [HttpDelete("comentario/like/{userId:int}/{comentarioId:int}")]
        public async Task<IActionResult> Delete([FromRoute] int userId, [FromRoute] int comentarioId)
        {
            try
            {
                var ok = await _likeService.DeleteComentarioLikeAsync(userId, comentarioId);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound("No se encontró el like para eliminar."));
                return Ok(ApiResponseBase.Ok(true, "Like eliminado correctamente."));
            } 
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error eliminando like para ComentarioId={ComentarioId} y UsuarioId={UserId}", comentarioId, userId);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al eliminar el like.", 500));
            }
        }

        [HttpGet("usuario/{userId:int}/likes")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        public async Task<IActionResult> GetLikedCommentsByUser([FromRoute] int userId)
        {
            try
            {
                var likedComments = await _likeService.GetLikedCommentsByUserAsync(userId);
                return Ok(ApiResponseBase.Ok(likedComments, "Comentarios likeados por el usuario obtenidos correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo comentarios likeados por usuario {UserId}", userId);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener comentarios likeados.", 500));
            }
        }
    }
}