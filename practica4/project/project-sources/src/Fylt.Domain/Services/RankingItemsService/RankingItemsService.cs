using Fylt.Domain.Mappers;
using Fylt.Domain.VOs;
using Fylt.Domain.VOs.RankingItemVO;
using Fylt.Infrastructure.Context;
using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.RankingItemsService
{
    public class RankingItemsService : IRankingItemsService
    {
        private readonly FyltContext _fyltContext;
        private readonly ILogger<RankingItemsService> _logger;

        public RankingItemsService(FyltContext fyltContext, ILogger<RankingItemsService> logger)
        {
            _fyltContext = fyltContext;
            _logger = logger;
        }

        public async Task<int> CreateRankingItemAsync(RankingItemVO itemVO)
        {
            // 1. Vérifier si le Ranking existe
            var rankingExists = await _fyltContext.Rankings
                .AnyAsync(r => r.Id == itemVO.IdRanking);

            if (!rankingExists)
            {
                _logger.LogWarning("Échec de création : Ranking ID {IdRanking} non trouvé.", itemVO.IdRanking);

                throw new KeyNotFoundException($"El Ranking con ID {itemVO.IdRanking} no existe.");
            }

            // 2. Vérifier si la Pelicula existe
            var peliculaExists = await _fyltContext.Peliculas // Assurez-vous d'avoir un DbSet Peliculas
                .AnyAsync(p => p.Id == itemVO.IdPelicula);

            if (!peliculaExists)
            {
                _logger.LogWarning("Error : no Pelicula con el ID {IdPelicula} buscada.", itemVO.IdPelicula);
                throw new KeyNotFoundException($"La Pelicula con ID {itemVO.IdPelicula} no existe.");
            }

            // 3. Création et enregistrement si les deux existent
            var entity = RankingItemsMappers.ToEntity(itemVO);

            // Note: Vous pouvez ajouter ici une vérification pour éviter les doublons (IdRanking, IdPelicula)

            _fyltContext.RankingItems.Add(entity);
            await _fyltContext.SaveChangesAsync();

            _logger.LogInformation("RankingItem créé pour Ranking ID {IdRanking} et Pelicula ID {IdPelicula}.", itemVO.IdRanking, itemVO.IdPelicula);

            return entity.Id;
        }

        public async Task<List<RankingItemVO>> GetItemsByRankingIdAsync(int rankingId)
        {
            var items = await _fyltContext.RankingItems
                .Where(ri => ri.IdRanking == rankingId)
                .AsNoTracking()
                .OrderBy(ri => ri.Posicion) // Trier par position pour un classement
                .ToListAsync();

            return RankingItemsMappers.ToVOList(items).ToList();
        }

        public async Task<bool> UpdateRankingItemAsync(RankingItemVO itemVO)
        {
            var existing = await _fyltContext.RankingItems.FindAsync(itemVO.Id);
            if (existing == null) return false;

            existing.Posicion = itemVO.Posicion;
            existing.Score = itemVO.Score;

            await _fyltContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteRankingItemAsync(int itemId)
        {
            var entity = await _fyltContext.RankingItems.FindAsync(itemId);
            if (entity == null) return false;

            _fyltContext.RankingItems.Remove(entity);
            await _fyltContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RecalculatePositionsAsync(int rankingId)
        {
            _logger.LogInformation("Démarrage de la transaction de recalcul des positions pour le classement ID : {RankingId}", rankingId);

            // Démarrer une transaction pour garantir que toutes les étapes sont atomiques
            await using var transaction = await _fyltContext.Database.BeginTransactionAsync();

            try
            {
                var items = await _fyltContext.RankingItems
                    .Where(ri => ri.IdRanking == rankingId)
                    .OrderByDescending(ri => ri.Score)
                    .ToListAsync();

                if (!items.Any())
                {
                    await transaction.CommitAsync();
                    return true;
                }

                const int TEMP_OFFSET = 100000;

                // --- ÉTAPE 1: Neutraliser la contrainte d'unicité (Mettre la position à 0) ---
                foreach (var item in items)
                {
                    item.Posicion = item.Posicion + TEMP_OFFSET; // Utiliser 0 ou un grand nombre unique pour l'étape temporaire
                }
                await _fyltContext.SaveChangesAsync();
                _logger.LogInformation("Étape 1 réussie : Positions temporairement neutralisées à 0.");


                // --- ÉTAPE 2: Appliquer la nouvelle position séquentielle (1, 2, 3...) ---
                int position = 1;
                foreach (var item in items)
                {
                    item.Posicion = position++; // Attribution de la position séquentielle unique
                }
                await _fyltContext.SaveChangesAsync();
                _logger.LogInformation("Étape 2 réussie : Nouvelles positions appliquées.");


                // Finaliser la transaction
                await transaction.CommitAsync();
                _logger.LogInformation("Positions recalculées et transaction terminée avec succès pour le Ranking ID : {RankingId}", rankingId);

                return true;
            }
            catch (Exception ex)
            {
                // En cas d'erreur (même la violation d'unicité), annuler toutes les modifications
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Échec de la transaction de recalcul des positions pour le classement ID {RankingId}. La base de données est inchangée.", rankingId);
                throw; // Renvoyer l'exception pour être gérée par le contrôleur
            }
        }
        }
    }
