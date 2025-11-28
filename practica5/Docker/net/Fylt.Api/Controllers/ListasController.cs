using Fylt.Contracts;
using Fylt.Domain.Services.ListasService;
using Fylt.Domain.VOs;
using Fylt.Domain.VOs.ListasVO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Fylt.Api.Controllers
{
    [ApiController]
    [Route("[controller]")] // Route: listas
    public class ListasController : ControllerBase
    {
        private readonly IListasService _listasService;
        private readonly ILogger<ListasController> _logger;

        public ListasController(IListasService listasService, ILogger<ListasController> logger)
        {
            _listasService = listasService;
            _logger = logger;
        }

        // --- GET ALL ---
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var listas = await _listasService.GetAllAsync();
                if (!listas.Any())
                    return NotFound(ApiResponseBase.NotFound("No se encontraron listas."));
                return Ok(ApiResponseBase.Ok(listas, "Listas obtenidas correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todas las listas");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener las listas.", 500));
            }
        }

        // --- GET BY ID ---
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            try
            {
                var lista = await _listasService.GetByIdAsync(id);
                if (lista is null)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró la lista con ID {id}."));
                return Ok(ApiResponseBase.Ok(lista, "Lista obtenida correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la lista por ID");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener la lista.", 500));
            }
        }

        // --- CREATE ---
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ListaVO nuevaLista)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(nuevaLista.Nombre))
                    return BadRequest(ApiResponseBase.BadRequest("El campo 'Nombre' es obligatorio."));

                var id = await _listasService.CreateListaAsync(nuevaLista);
                return CreatedAtAction(
                    nameof(GetById),
                    new { id },
                    ApiResponseBase.Ok(id, "Lista creada correctamente.", 201)
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al crear lista");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear la lista.", 500));
            }
        }

        // --- CREATE BY USER ---
        [HttpPost("usuario/{usuarioId}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)] // Indica que la respuesta exitosa devolverá un ApiResponseBase
        [ProducesResponseType(typeof(ApiResponseBase), 404)] // Indica que la respuesta error devolverá un ApiResponseBase
        [ProducesResponseType(typeof(ApiResponseBase), 500)]
        public async Task<IActionResult> Create([FromBody] ListaVO nuevaLista, [FromRoute] int usuarioId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(nuevaLista.Nombre))
                    return BadRequest(ApiResponseBase.BadRequest("El campo 'Nombre' es obligatorio."));

                int newListId = await _listasService.CreateListaConUsuario(nuevaLista, usuarioId);

                return CreatedAtAction(nameof(GetById), new { id = newListId }, ApiResponseBase.Ok(nuevaLista, "Lista creada correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al crear lista");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al crear el usuario.", 500));
            }

        }

        // --- UPDATE ---
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] ListaVO lista)
        {
            try
            {
                if (id != lista.Id)
                    return BadRequest(ApiResponseBase.BadRequest("El ID de la ruta no coincide con el del cuerpo."));
                if (string.IsNullOrWhiteSpace(lista.Nombre))
                    return BadRequest(ApiResponseBase.BadRequest("El campo 'Nombre' es obligatorio."));

                var ok = await _listasService.UpdateListaAsync(lista);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró la lista con ID {id} para actualizar."));
                return Ok(ApiResponseBase.Ok(true, "Lista actualizada correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno al actualizar la lista");
                return StatusCode(500, ApiResponseBase.Fail("Error interno al actualizar la lista.", 500));
            }
        }

        // --- DELETE ---
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            try
            {
                var ok = await _listasService.DeleteListaAsync(id);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"No se encontró la lista con ID {id} para eliminar."));
                return Ok(ApiResponseBase.Ok(true, "Lista eliminada correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la lista con ID {Id}", id);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al eliminar la lista.", 500));
            }
        }

        // --- ADD PELICULA (Exemple de gestion de relation) ---
        [HttpPost("{listaId:int}/peliculas/{peliculaId:int}")]
        public async Task<IActionResult> AddPelicula([FromRoute] int listaId, [FromRoute] int peliculaId)
        {
            try
            {
                var ok = await _listasService.AddPeliculaToListaAsync(listaId, peliculaId);
                if (!ok)
                    return BadRequest(ApiResponseBase.Fail($"No se pudo añadir la película {peliculaId} a la lista {listaId}.", 400));

                return Ok(ApiResponseBase.Ok(true, "Película añadida a la lista."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al añadir la película {PeliculaId} a la lista {ListaId}", peliculaId, listaId);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al añadir la película a la lista.", 500));
            }
        }

        //Listas de un usuario

        [HttpGet("usuario/{usuarioId:int}")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetListasByUsuarioId([FromRoute] int usuarioId)
        {
            try
            {
                var listas = await _listasService.GetListasByUsuarioIdAsync(usuarioId);

                if (listas == null || !listas.Any())
                    // Si la liste existe mais est vide, on retourne 200 OK avec une liste vide et un message informatif
                    return NotFound(ApiResponseBase.NotFound($"No lista encontrada para el usuario {usuarioId}."));

                return Ok(ApiResponseBase.Ok(listas, $"Listas obtenidas correctamente para el usuario {usuarioId}."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las listas del usuario {UsuarioId}", usuarioId);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener las listas del usuario.", 500));
            }
        }

        // --- REMOVE PELICULA (Exemple de gestion de relation) ---
        [HttpDelete("{listaId:int}/peliculas/{peliculaId:int}")]
        public async Task<IActionResult> RemovePelicula([FromRoute] int listaId, [FromRoute] int peliculaId)
        {
            try
            {
                var ok = await _listasService.RemovePeliculaFromListaAsync(listaId, peliculaId);
                if (!ok)
                    return NotFound(ApiResponseBase.NotFound($"Relación no encontrada entre la lista {listaId} y la película {peliculaId}."));

                return Ok(ApiResponseBase.Ok(true, "Película eliminada de la lista."));
            } 
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la película {PeliculaId} de la lista {ListaId}", peliculaId, listaId);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al eliminar la película de la lista.", 500));
            }
        }

        // --- GET PELICULAS BY LISTA ID ---

        [HttpGet("{listaId:int}/peliculas")] // route: GET /listas/{listaId}/peliculas
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        public async Task<IActionResult> GetPeliculasByListaId([FromRoute] int listaId)
        {
            try
            {
                var peliculas = await _listasService.GetPeliculasByListaIdAsync(listaId);

                // On vérifie d'abord si la liste existe (méthode GetByIdAsync) pour retourner un 404 si la liste n'existe pas
                var lista = await _listasService.GetByIdAsync(listaId);
                if (lista is null)
                    return NotFound(ApiResponseBase.NotFound($"La lista con ID {listaId} no fue encontrada."));

                if (peliculas == null || !peliculas.Any())
                    // Si la liste existe mais est vide, on retourne 200 OK avec une liste vide et un message informatif
                    return Ok(ApiResponseBase.Ok(peliculas, $"Lista {listaId} encontrada, pero sin películas."));

                return Ok(ApiResponseBase.Ok(peliculas, $"Películas obtenidas correctamente para la lista {listaId}."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las películas de la lista {ListaId}", listaId);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al obtener las películas de la lista.", 500));
            }
        }
    }
}