using Fylt.Contracts;
using Fylt.Domain.Services.PeliculasService;
using Fylt.Domain.Services.TmdbService;
using Fylt.Domain.VOs.PeliculasVO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Text.Json.Nodes;


namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PeliculasController : ControllerBase
    {
        private static readonly Dictionary<int, string> GenreMap = new()
        {
            { 28, "Acción" },
            { 12, "Aventura" },
            { 16, "Animación" },
            { 35, "Comedia" },
            { 80, "Crimen" },
            { 99, "Documental" },
            { 18, "Drama" },
            { 10751, "Familiar" },
            { 14, "Fantasía" },
            { 36, "Historia" },
            { 27, "Terror" },
            { 10402, "Música" },
            { 9648, "Misterio" },
            { 10749, "Romance" },
            { 878, "Ciencia ficción" },
            { 10770, "Película de TV" },
            { 53, "Suspense" },
            { 10752, "Guerra" },
            { 37, "Western" }
        };

        private readonly IPeliculasService _peliculasService;
        private readonly TmdbService _tmdbService;
        private readonly ILogger<PeliculasController> _logger;

        public PeliculasController(IPeliculasService peliculasService, TmdbService tmdbService, ILogger<PeliculasController> logger)
        {
            _peliculasService = peliculasService;
            _tmdbService = tmdbService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var peliculas = await _peliculasService.GetAllAsync();
            if (peliculas == null || !peliculas.Any())
                return NotFound(ApiResponseBase.NotFound("No se encontraron películas locales."));
            return Ok(ApiResponseBase.Ok(peliculas, "Películas obtenidas correctamente."));
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var pelicula = await _peliculasService.GetByIdAsync(id);
            if (pelicula == null)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la película con ID {id}."));
            _logger.LogInformation(
                "🎬 Recogiendo película con campos --> Id interno: {Id}, ExternalId: {ExternalId}, Título: {Titulo}, Fecha: {Fecha}",
                pelicula.Id,
                pelicula.ExternalId,
                pelicula.Titulo,
                pelicula.Fecha
            );
            return Ok(ApiResponseBase.Ok(pelicula, "Película obtenida correctamente."));
        }

        // NUEVO MÉTODO IMPORTAR DESDE TMDB
        [HttpPost("importar/tmdb")]
        public async Task<IActionResult> ImportarDesdeTmdb()
        {
            try
            {
                _logger.LogInformation("Iniciando importación desde TMDB...");

                JsonArray tmdbMovies = await _tmdbService.GetPopularMoviesAsync();
                int nuevas = 0;

                foreach (var movie in tmdbMovies)
                {
                    if (movie == null) continue;

                    int externalId = movie["id"]?.GetValue<int>() ?? 0;

                    // Evitar duplicados
                    if (await _peliculasService.ExistsByExternalIdAsync(externalId))
                        continue;

                    // --------------------------
                    //  Obtener y traducir géneros
                    // --------------------------
                    var genreArray = movie["genre_ids"]?.AsArray();
                    var generos = new List<string>();

                    if (genreArray != null)
                    {
                        foreach (var g in genreArray)
                        {
                            int gid = g?.GetValue<int>() ?? 0;
                            if (GenreMap.TryGetValue(gid, out var nombre))
                                generos.Add(nombre);
                        }
                    }

                    // --------------------------
                    //  Crear VO de Película
                    // --------------------------
                    var pelicula = new PeliculaVO
                    {
                        ExternalId = externalId,
                        Titulo = movie["title"]?.ToString() ?? "Sin título",
                        Descripcion = movie["overview"]?.ToString(),
                        Imagen = movie["poster_path"] != null
                           ? $"https://image.tmdb.org/t/p/w500{movie["poster_path"]}"
                           : null,
                        Fecha = DateTime.TryParse(movie["release_date"]?.ToString(), out var fecha) ? fecha : null,
                        Valoracion = (int?)Math.Round(
                            double.TryParse(movie["vote_average"]?.ToString(), out var vot) ? vot : 0
                        ),

                        // LISTA DE STRINGS → se serializa luego en mapper
                        Generos = generos
                    };

                    await _peliculasService.CreatePeliculaAsync(pelicula);
                    nuevas++;
                }

                return Ok(ApiResponseBase.Ok(nuevas, $"Se importaron {nuevas} películas nuevas desde TMDB."));
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
            if (string.IsNullOrWhiteSpace(nuevaPelicula.Titulo))
                return BadRequest(ApiResponseBase.BadRequest("El campo 'Titulo' es obligatorio."));

            var id = await _peliculasService.CreatePeliculaAsync(nuevaPelicula);
            return CreatedAtAction(nameof(GetById), new { id }, ApiResponseBase.Ok(id, "Película creada correctamente.", 201));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] PeliculaVO pelicula)
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
                _logger.LogInformation("stá entrando al if pero pone mal el nuevo id", pelicula.ExternalId);
            }
            _logger.LogInformation("El Id que ha llegado es {ExternalId}", pelicula.ExternalId);
            var ok = await _peliculasService.UpdatePeliculaAsync(pelicula);
            if (!ok)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la película con ID {id} para actualizar."));
            return Ok(ApiResponseBase.Ok(true, "Película actualizada correctamente."));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _peliculasService.DeletePeliculaAsync(id);
            if (!ok)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la película con ID {id} para eliminar."));
            return Ok(ApiResponseBase.Ok(true, $"Película con ID {id} eliminada correctamente."));
        }
    }
}
