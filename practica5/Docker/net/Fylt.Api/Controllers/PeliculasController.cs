using Fylt.Contracts;
using Fylt.Domain.Clients.TMDBClient;
using Fylt.Domain.Clients.YoutubeClient;
using Fylt.Domain.Services.PeliculasService;
using Fylt.Domain.VOs.PeliculasVO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Text.Json.Nodes;


namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PeliculasController : ControllerBase
    {
        

        private readonly IPeliculasService _peliculasService;
        private readonly ITMDBClient _tmdbService;
        private readonly ILogger<PeliculasController> _logger;
        public PeliculasController(IPeliculasService peliculasService, ITMDBClient tmdbService, ILogger<PeliculasController> logger)
        {
            _peliculasService = peliculasService;
            _tmdbService = tmdbService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            try
            {
                var peliculas = await _peliculasService.GetAllAsync();
                if (peliculas == null || !peliculas.Any())
                    return NotFound(ApiResponseBase.NotFound("No se encontraron películas locales."));
                return Ok(ApiResponseBase.Ok(peliculas, "Películas obtenidas correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todas las películas.");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener las películas.", 500));
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            try
            {
                var pelicula = await _peliculasService.GetByIdAsync(id);
                if (pelicula == null)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró la película con ID {id}."));
                _logger.LogInformation(
                    "Recogiendo película con campos --> Id interno: {Id}, ExternalId: {ExternalId}, Título: {Titulo}, Fecha: {Fecha}",
                    pelicula.Id,
                    pelicula.ExternalId,
                    pelicula.Titulo,
                    pelicula.Fecha
                );
                return Ok(ApiResponseBase.Ok(pelicula, "Película obtenida correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la película con ID {Id}", id);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener la película.", 500));
            }
        }

        // NUEVO MÉTODO IMPORTAR DESDE TMDB
        [HttpPost("importar/tmdb")]
        public async Task<IActionResult> ImportarPeliculas()
        {
            try
            {
               return Ok();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "No hay API Key configurada para TMDB.");
                return BadRequest(ApiResponseBase.Fail(ex.Message, 400));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al importar películas desde TMDB.");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al importar películas desde TMDB.", 500));
            }
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PeliculaVO nuevaPelicula)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(nuevaPelicula.Titulo))
                    return BadRequest(ApiResponseBase.BadRequest("El campo 'Titulo' es obligatorio."));

                var id = await _peliculasService.CreatePeliculaAsync(nuevaPelicula);
                return CreatedAtAction(nameof(GetById), new { id }, ApiResponseBase.Ok(id, "Película creada correctamente.", 201));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear la película.");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear la película.", 500));
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] PeliculaVO pelicula)
        {
            try
            {

                if (id != pelicula.Id)
                    return BadRequest(ApiResponseBase.BadRequest("El ID de la ruta no coincide con el del cuerpo."));
                if (string.IsNullOrWhiteSpace(pelicula.Titulo))
                    return BadRequest(ApiResponseBase.BadRequest("El campo 'Titulo' es obligatorio."));

                var pelExistente = await _peliculasService.GetByIdAsync(id);
                _logger.LogInformation(
                    "Pelicula encontrada: Id interno = {Id}, ExternalId actual = {ExternalIdExistente}, ExternalId recibido = {ExternalIdRecibido}",
                    pelExistente.Id, pelExistente.ExternalId, pelicula.ExternalId
                );
                if (pelicula.ExternalId == 0 || pelicula.ExternalId == pelicula.Id)
                {
                    pelicula.ExternalId = pelExistente.ExternalId;
                    _logger.LogInformation("Está entrando al if pero pone mal el nuevo id", pelicula.ExternalId);
                }
                _logger.LogInformation("El Id que ha llegado es {ExternalId}", pelicula.ExternalId);
                var ok = await _peliculasService.UpdatePeliculaAsync(pelicula);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró la película con ID {id} para actualizar."));
                return Ok(ApiResponseBase.Ok(true, "Película actualizada correctamente."));

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la película con ID {Id}", id);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al actualizar la película.", 500));
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var ok = await _peliculasService.DeletePeliculaAsync(id);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró la película con ID {id} para eliminar."));
                return Ok(ApiResponseBase.Ok(true, $"Película con ID {id} eliminada correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la película con ID {Id}", id);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al eliminar la película.", 500));
            }
        }

        [HttpGet("{id:int}/trailer")]
        public async Task<IActionResult> GetTrailer(int id)
        {
            try
            {
                var trailer = await _peliculasService.GetTrailerAsync(id);

                if (trailer == null)
                    return NotFound(ApiResponseBase.NotFound("No se encontró trailer para esta película."));

                return Ok(ApiResponseBase.Ok(trailer, "Trailer obtenido correctamente."));
            } catch(Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el trailer para la película con ID {Id}", id);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener el trailer.", 500));
            }
        }
    }
}
