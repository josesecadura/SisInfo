import Image from "next/image"
import Link from "next/link"

interface MovieCardProps {
  id?: number
  title?: string
  imageUrl?: string
  small?: boolean
  onClick?: (e?: React.MouseEvent) => void
}

export function MovieCard({ id = 1, title, imageUrl, small = false, onClick }: MovieCardProps) {
  const widthClass = small ? "w-[160px]" : "w-[200px]"
  if (onClick) {
    return (
      <div onClick={onClick} className={`group relative shrink-0 ${widthClass} cursor-pointer`}>
        <div className="relative aspect-2/3 overflow-hidden rounded-lg border-2 border-primary/50 bg-muted transition-all group-hover:border-primary group-hover:scale-105">
          <Image
            src={imageUrl || "/placeholder.svg?height=300&width=200"}
            alt={title || "Movie poster"}
            fill
            className="object-cover"
          />
        </div>
        {title && <p className="mt-2 text-sm font-medium text-center line-clamp-2">{title}</p>}
      </div>
    )
  }

  return (
    <Link href={`/movie/${id}`} className={`group relative shrink-0 ${widthClass} cursor-pointer`}>
      <div className="relative aspect-2/3 overflow-hidden rounded-lg border-2 border-primary/50 bg-muted transition-all group-hover:border-primary group-hover:scale-105">
        <Image
          src={imageUrl || "/placeholder.svg?height=300&width=200"}
          alt={title || "Movie poster"}
          fill
          className="object-cover"
        />
      </div>
      {title && <p className="mt-2 text-sm font-medium text-center line-clamp-2">{title}</p>}
    </Link>
  )
}
