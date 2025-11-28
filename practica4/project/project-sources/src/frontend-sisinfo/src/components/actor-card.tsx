import Image from "next/image"

interface ActorCardProps {
  name: string
  description: string
  imageUrl?: string
}

export function ActorCard({ name, description, imageUrl }: ActorCardProps) {
  return (
    <div className="flex-shrink-0 w-[320px] rounded-xl bg-primary/20 p-6 border border-primary/30">
      <div className="flex gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-3">{name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          <Image src={imageUrl || "/placeholder.svg?height=96&width=96"} alt={name} fill className="object-cover" />
        </div>
      </div>
    </div>
  )
}
