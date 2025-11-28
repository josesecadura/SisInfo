// Export all services
export * from "./client"
export * from "./config"
export { movieService } from "./services/movie.service"
export { reviewService } from "./services/review.service"
export { surveyService } from "./services/survey.service"
export { userService } from "./services/user.service"
export { authService } from "./services/auth.service"

// Export types
export type { Movie, ImportMoviesPayload } from "./services/movie.service"
export type { Review } from "./services/review.service"
export type { Survey, VoteSurveyPayload } from "./services/survey.service"
export type { User } from "./services/user.service"
export type { LoginPayload, RegisterPayload, AuthResponse } from "./services/auth.service"
