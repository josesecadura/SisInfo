namespace Fylt.Contracts
{
    public class ApiResponseBase
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string? Message { get; set; }
        public object? Data { get; set; }

        // ✅ Métodos de ayuda para crear respuestas estándar (Llamadas que hacen lo mismo pero cambia el Data)
        public static ApiResponseBase Ok(object? data = null, string? message = "Operación exitosa", int statusCode = 200)
        {
            return new ApiResponseBase
            {
                Success = true,
                StatusCode = statusCode,
                Message = message,
                Data = data
            };
        }

        public static ApiResponseBase Fail(string? message = "Ha ocurrido un error", int statusCode = 500, object? data = null)
        {
            return new ApiResponseBase
            {
                Success = false,
                StatusCode = statusCode,
                Message = message,
                Data = data
            };
        }

        public static ApiResponseBase NotFound(string? message = "Recurso no encontrado", object? data = null)
        {
            return new ApiResponseBase
            {
                Success = false,
                StatusCode = 404,
                Message = message,
                Data = data
            };
        }

        public static ApiResponseBase BadRequest(string? message = "Solicitud inválida", object? data = null)
        {
            return new ApiResponseBase
            {
                Success = false,
                StatusCode = 400,
                Message = message,
                Data = data
            };
        }
    }
}
