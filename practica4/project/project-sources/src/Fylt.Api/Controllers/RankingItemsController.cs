using Fylt.Contracts;
using Fylt.Domain.Services.RankingItemsService;
using Fylt.Domain.VOs;
using Fylt.Domain.VOs.RankingItemVO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Threading.Tasks;

namespace Fylt.Api.Controllers
{
    [ApiController]
    // La route ici est spécifique à l'item, mais on pourrait la baser sur /rankings si vous avez un RankingController
    [Route("rankings/{rankingId:int}/items")]
    public class RankingItemsController : ControllerBase
    {
        private readonly IRankingItemsService _itemService;
        private readonly ILogger<RankingItemsController> _logger;

        public RankingItemsController(IRankingItemsService itemService, ILogger<RankingItemsController> logger)
        {
            _itemService = itemService;
            _logger = logger;
        }

        // --- GET ALL ITEMS BY RANKING ID ---
        // GET rankings/{rankingId}/items
        [HttpGet]
        public async Task<IActionResult> GetItemsByRankingId([FromRoute] int rankingId)
        {
            var items = await _itemService.GetItemsByRankingIdAsync(rankingId);

            if (items == null || !items.Any())
                return NotFound(ApiResponseBase.NotFound($"No se encontraron items para el ranking ID {rankingId}."));

            return Ok(ApiResponseBase.Ok(items, $"Items obtenidos correctamente para el ranking {rankingId}."));
        }

        // --- CREATE ITEM ---
        // POST rankings/{rankingId}/items
        [HttpPost]
        public async Task<IActionResult> Create([FromRoute] int rankingId, [FromBody] RankingItemVO newItem)
        {
            // S'assurer que l'ID de la route est utilisé pour la création
            if (rankingId != newItem.IdRanking)
                return BadRequest(ApiResponseBase.BadRequest("El ID de ranking de la ruta no coincide con el del cuerpo."));

            var id = await _itemService.CreateRankingItemAsync(newItem);

            // Comme la route GET par ID est difficile ici (item par ID de RankingItem), 
            // on retourne juste le nouvel ID.
            return StatusCode(201, ApiResponseBase.Ok(id, "Item de ranking creado correctamente.", 201));
        }

        // --- UPDATE ITEM (by Item ID) ---
        // PUT rankings/{rankingId}/items/{itemId}
        [HttpPut("{itemId:int}")]
        public async Task<IActionResult> Update([FromRoute] int itemId, [FromBody] RankingItemVO item)
        {
            if (itemId != item.Id)
                return BadRequest(ApiResponseBase.BadRequest("El ID del item en la ruta no coincide con el del cuerpo."));

            var ok = await _itemService.UpdateRankingItemAsync(item);

            if (!ok)
                return NotFound(ApiResponseBase.NotFound($"No se encontró el item de ranking con ID {itemId} para actualizar."));

            return Ok(ApiResponseBase.Ok(true, "Item de ranking actualizado correctamente."));
        }

        // --- DELETE ITEM (by Item ID) ---
        // DELETE rankings/{rankingId}/items/{itemId}
        [HttpDelete("{itemId:int}")]
        public async Task<IActionResult> Delete([FromRoute] int itemId)
        {
            var ok = await _itemService.DeleteRankingItemAsync(itemId);

            if (!ok)
                return NotFound(ApiResponseBase.NotFound($"No se encontró el item de ranking con ID {itemId} para eliminar."));

            return Ok(ApiResponseBase.Ok(true, "Item de ranking eliminado correctamente."));
        }

        /// <summary>
        /// Recalcule les positions (Posicion) de tous les items d'un classement en se basant sur le Score (décroissant) 
        /// et met à jour la base de données.
        /// </summary>
        [HttpPost("~/rankings/{rankingId:int}/recalculate")]
        [ProducesResponseType(typeof(ApiResponseBase), 200)]
        [ProducesResponseType(typeof(ApiResponseBase), 404)]
        [ProducesResponseType(typeof(ApiResponseBase), 500)]
        public async Task<IActionResult> RecalculatePositions([FromRoute] int rankingId)
        {
            _logger.LogInformation("Requête de recalcul des positions pour le classement ID : {RankingId}", rankingId);

            try
            {
                var ok = await _itemService.RecalculatePositionsAsync(rankingId);

                // Note : Notre service RecalculatePositionsAsync retourne true même si le classement est vide.
                // Si vous souhaitez retourner 404 Not Found si le Ranking lui-même n'existe pas,
                // vous devriez implémenter une vérification dans le service et retourner false.

                if (!ok)
                {
                    // Cette vérification est ici en prévention si le service venait à évoluer pour retourner false
                    return NotFound(ApiResponseBase.NotFound($"El Ranking con ID {rankingId} no fue encontrado o no se pudo procesar."));
                }

                return Ok(ApiResponseBase.Ok(true, $"Posiciones del ranking {rankingId} recalculadas y guardadas correctamente."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du recalcul des positions pour le classement ID {RankingId}. Détail: {Message}", rankingId, ex.Message);
                return StatusCode(500, ApiResponseBase.Fail("Error interno al recalcular las posiciones.", 500));
            }
        }
    }
}