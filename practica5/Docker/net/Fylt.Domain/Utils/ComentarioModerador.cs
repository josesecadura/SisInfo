using System;
using System.Collections.Generic;
using System.Linq;

namespace Fylt.Domain.Utils
{
    public static class ComentarioModerador
    {
        private static readonly HashSet<string> PalabrasProhibidas = new(StringComparer.OrdinalIgnoreCase)
        {
            "insulto", "tonto", "estúpido", "idiota", "maldito", "asco", "mierda"
        };

        public static bool EsAprobado(string? texto)
        {
            if (string.IsNullOrWhiteSpace(texto))
                return false; // si no hay texto, no se aprueba

            var palabras = texto.Split(new[] { ' ', ',', '.', ';', ':', '!', '?' }, StringSplitOptions.RemoveEmptyEntries);
            return !palabras.Any(p => PalabrasProhibidas.Contains(p));
        }
    }
}
