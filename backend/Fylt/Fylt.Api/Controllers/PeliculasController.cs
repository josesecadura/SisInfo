using Fylt.Contracts;
using Fylt.Domain.Services.PeliculasService; 
using Fylt.Domain.VOs.PeliculasVO; 
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("[controller]")] 
    public class PeliculasController : ControllerBase
    {
        private readonly IPeliculasService _peliculasService; // Service injecté pour la logique des films
        private readonly ILogger<PeliculasController> _logger; // Logger

        public PeliculasController(IPeliculasService peliculasService, ILogger<PeliculasController> logger)
        {
            _peliculasService = peliculasService;
            _logger = logger;
        }

        // --- Récupération des films locaux ---

        [HttpGet] // route: GET peliculas
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            _logger.LogInformation("Requête de tous les films locaux.");
            var peliculas = await _peliculasService.GetAllAsync();

            if (peliculas == null || !peliculas.Any())
                return NotFound(ApiResponseBase.NotFound("No se encontraron películas locales."));

            return Ok(ApiResponseBase.Ok(peliculas, "Películas obtenidas correctamente."));
        }

       
        [HttpGet("{id:int}")] // route: GET peliculas/{id}
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetById([FromRoute] int id, CancellationToken ct)
        {
            var pelicula = await _peliculasService.GetByIdAsync(id);

            if (pelicula is null)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la película con ID {id}."));

            return Ok(ApiResponseBase.Ok(pelicula, "Película obtenida correctamente."));
        }

        // --- Importation depuis une API externe ---

        [HttpPost("importar")] // route: POST peliculas/importar?apiUrl=...
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 500)]
        public async Task<IActionResult> Importar([FromQuery] string apiUrl)
        {
            if (string.IsNullOrWhiteSpace(apiUrl))
            {
                return BadRequest(ApiResponseBase.BadRequest("Le paramètre 'apiUrl' est requis pour l'importation."));
            }

            _logger.LogInformation("Démarrage de l'importation des films depuis l'API : {Url}", apiUrl);

            var ok = await _peliculasService.ImportarPeliculasDesdeApiAsync(apiUrl);

            if (!ok)
            {
                // Le service gère déjà la journalisation des erreurs
                return StatusCode(500, ApiResponseBase.Fail("Erreur lors de l'importation des películas depuis l'API. Consultez les logs pour plus de détails.", 500));
            }

            return Ok(ApiResponseBase.Ok(true, "Importation et mise à jour des películas terminées avec succès."));
        }

        // --- Création d'un film (Ajout Manuel) ---

        [HttpPost] // route: POST peliculas
        [ProducesResponseType(typeof(ApiResponseBase), 201)]
        [ProducesResponseType(typeof(ApiResponseBase), 400)]
        [ProducesResponseType(typeof(ApiResponseBase), 500)]
        public async Task<IActionResult> Create([FromBody] PeliculaVO nuevaPelicula, CancellationToken ct)
        {
            // Vérification simple que le titre est fourni
            if (string.IsNullOrWhiteSpace(nuevaPelicula.Titulo))
            {
                return BadRequest(ApiResponseBase.BadRequest("Le champ 'Titulo' est obligatoire."));
            }

            try
            {
                // Appelle le service pour créer le film et récupérer le nouvel ID
                var id = await _peliculasService.CreatePeliculaAsync(nuevaPelicula);

                // Retourne une réponse 201 Created avec l'ID
                return CreatedAtAction(
                    nameof(GetById), 
                    new { id },
                    ApiResponseBase.Ok(id, "Película creada correctamente.", 201)
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur interne lors de la création de la película.");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear la película.", 500));
            }
        }

        // --- Mise à jour d'un film (Modification Manuelle) ---

        [HttpPut("{id:int}")] // route: PUT peliculas/{id}
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 400)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] PeliculaVO pelicula, CancellationToken ct)
        {
            // Vérification de cohérence entre l'ID de la route et l'ID du corps
            if (id != pelicula.Id)
                return BadRequest(ApiResponseBase.BadRequest("El ID de la ruta no coincide con el del cuerpo."));

            // Vérification simple que le titre est fourni
            if (string.IsNullOrWhiteSpace(pelicula.Titulo))
            {
                return BadRequest(ApiResponseBase.BadRequest("Le champ 'Titulo' est obligatoire pour la mise à jour."));
            }

            var ok = await _peliculasService.UpdatePeliculaAsync(pelicula);

            if (!ok)
                // Le service retourne false si le film n'est pas trouvé
                return NotFound(ApiResponseBase.NotFound($"No se encontró la película con ID {id} para actualizar."));

            return Ok(ApiResponseBase.Ok(true, "Película actualizada correctamente."));
        }

        // --- Suppression d'un film local ---

        [HttpDelete("{id:int}")] // route: DELETE peliculas/{id}
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        [ProducesResponseType(typeof(ApiResponseBase), 500)]
        public async Task<IActionResult> Delete([FromRoute] int id, CancellationToken ct)
        {
            _logger.LogInformation("Requête de suppression du film avec ID : {Id}", id);

            var ok = await _peliculasService.DeletePeliculaAsync(id);

            if (!ok)
            {
                // Si la suppression échoue (souvent parce que l'ID n'existe pas)
                return NotFound(ApiResponseBase.NotFound($"No se encontró la película con ID {id} para eliminar."));
            }

            return Ok(ApiResponseBase.Ok(true, $"Película con ID {id} eliminada correctamente."));
        }
    }
}