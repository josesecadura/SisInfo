using Fylt.Domain.Mappers;
using Fylt.Domain.VOs;
using Fylt.Domain.VOs.RankingVO;
using Fylt.Infrastructure.Context;
using Fylt.Infrastructure.DAOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Fylt.Domain.Services.RankingsService
{
    public class RankingsService : IRankingsService
    {
        private readonly FyltContext _fyltContext;
        private readonly ILogger<RankingsService> _logger;

        public RankingsService(FyltContext fyltContext, ILogger<RankingsService> logger)
        {
            _fyltContext = fyltContext;
            _logger = logger;
        }

        // --- CREATE ---
        public async Task<int> CreateRankingAsync(RankingVO rankingVO)
        {
            var entity = RankingsMappers.ToEntity(rankingVO);
            _fyltContext.Rankings.Add(entity); // Assurez-vous que Rankings est une DbSet
            await _fyltContext.SaveChangesAsync();
            return entity.Id;
        }

        // --- GET ALL ---
        public async Task<List<RankingVO>> GetAllAsync()
        {
            var rankings = await _fyltContext.Rankings.AsNoTracking().ToListAsync();
            return RankingsMappers.ToVOList(rankings).ToList();
        }

        // --- GET BY ID ---
        public async Task<RankingVO?> GetByIdAsync(int id)
        {
            var entity = await _fyltContext.Rankings.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            return RankingsMappers.ToVO(entity);
        }

        // --- UPDATE ---
        public async Task<bool> UpdateRankingAsync(RankingVO rankingVO)
        {
            var existing = await _fyltContext.Rankings.FirstOrDefaultAsync(x => x.Id == rankingVO.Id);
            if (existing == null) return false;

            existing.Titulo = rankingVO.Titulo;
            existing.Descripcion = rankingVO.Descripcion;
            existing.Tipo = rankingVO.Tipo;
            existing.Periodo = rankingVO.Periodo;
            existing.Fecha = rankingVO.Fecha;

            await _fyltContext.SaveChangesAsync();
            return true;
        }

        // --- DELETE ---
        // ATTENTION : Cette méthode DEVRA être modifiée si la suppression en cascade n'est pas configurée
        // pour supprimer d'abord les entités RankingItem liées.
        public async Task<bool> DeleteRankingAsync(int id)
        {
            // 1. Trouver l'entité Ranking.
            var rankingEntity = await _fyltContext.Rankings.FindAsync(id);

            if (rankingEntity == null)
            {
                _logger.LogWarning("Suppression échouée : Ranking avec ID {Id} non trouvé.", id);
                return false;
            }

            // 2. Trouver TOUS les enregistrements RankingItem liés à ce Ranking.
            // Assurez-vous que 'RankingItems' est le nom de votre DbSet pour cette entité.
            var itemsLies = await _fyltContext.RankingItems
                .Where(ri => ri.IdRanking == id)
                .ToListAsync();

            // 3. Supprimer tous les RankingItems trouvés.
            if (itemsLies.Any())
            {
                _fyltContext.RankingItems.RemoveRange(itemsLies);
                _logger.LogInformation("{Count} items liés au Ranking ID {Id} supprimés.", itemsLies.Count, id);
            }

            // 4. Supprimer l'entité Ranking elle-même.
            _fyltContext.Rankings.Remove(rankingEntity);

            // 5. Enregistrer les changements.
            await _fyltContext.SaveChangesAsync();
            _logger.LogInformation("Ranking avec ID {Id} et ses items liés supprimés avec succès.", id);

            return true;
        }
    }
}