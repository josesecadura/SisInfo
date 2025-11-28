// Export all services
export * from "./client"
export * from "./config"
export { movieService } from "./services/movie.service"
export { reviewService } from "./services/review.service"
export { userService } from "./services/user.service"
export { authService } from "./services/auth.service"
export { encuestaService } from "./services/encuesta.service"
export { usuarioSeguidorService } from "./services/usuarioSeguidor.service"

// Export types
export type { Movie, ImportMoviesPayload } from "./services/movie.service"
export type { Review } from "./services/review.service"
export type { Encuesta, CreateEncuestaDTO, UpdateEncuestaDTO } from "./services/encuesta.service"
export type { User } from "./services/user.service"
export type { LoginPayload, RegisterPayload, AuthResponse } from "./services/auth.service"
export type { FollowVO, CreateFollowVO, UserSearchResult } from "./services/usuarioSeguidor.service"
