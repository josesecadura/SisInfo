import { CommentCard, CommentCardProps } from "./comment-card"

export type CommentCardCompactProps = Omit<CommentCardProps, "showPoster" | "movieImage"> & {
  movieImage?: string | null
}

export function CommentCardCompact(props: CommentCardCompactProps) {
  return <CommentCard {...props} showPoster={false} />
}
