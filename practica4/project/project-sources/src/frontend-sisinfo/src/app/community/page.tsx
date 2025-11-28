"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"friends" | "survey">("friends")

  const mockPosts = [
    {
      id: 1,
      user: "Pepito_el_grillo",
      content:
        "Esta película me parece terrible, no se como dejaron poner esto en los cines. Sinceramente es una de las pocas películas donde he llegado a dormirme en el cine. Los niños lloraban desconsoladamente en la parte donde explotan los coches. No la recomiendo",
      likes: 500,
      movieImage: "/placeholder.svg?height=150&width=100",
    },
    {
      id: 2,
      user: "Pepito_el_grillo",
      content:
        "Esta película me parece terrible, no se como dejaron poner esto en los cines. Sinceramente es una de las pocas películas donde he llegado a dormirme en el cine. Los niños lloraban desconsoladamente en la parte donde explotan los coches. No la recomiendo",
      likes: 500,
      movieImage: "/placeholder.svg?height=150&width=100",
    },
  ]

  const mockRecommendations = [
    {
      id: 1,
      user: "Pepito_el_grillo",
      content:
        "Esta película me parece terrible, no se como dejaron poner esto en los cines. Sinceramente es una de las pocas películas donde he llegado a dormirme en el cine. Los niños lloraban desconsoladamente en la parte donde explotan los coches. No la recomiendo",
      likes: 500,
      movieImage: "/placeholder.svg?height=150&width=100",
    },
  ]

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-4xl">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setActiveTab("friends")}
          className={`py-6 rounded-2xl text-2xl font-bold transition-all ${
            activeTab === "friends"
              ? "bg-blue-950/50 border-2 border-blue-500/50"
              : "bg-card border-2 border-border hover:border-blue-500/30"
          }`}
        >
          Friends
        </button>
        <button
          onClick={() => setActiveTab("survey")}
          className={`py-6 rounded-2xl text-2xl font-bold transition-all ${
            activeTab === "survey"
              ? "bg-purple-950/50 border-2 border-primary/50"
              : "bg-card border-2 border-border hover:border-primary/30"
          }`}
        >
          Survey
        </button>
      </div>

      {/* Más populares Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Más populares</h2>
          <Button variant="link" className="text-primary">
            VER MÁS →
          </Button>
        </div>
        <div className="space-y-6">
          {mockPosts.map((post) => (
            <div key={post.id} className="flex gap-4 p-4 rounded-xl border-2 border-primary/30 bg-card">
              <div className="relative w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                <Image src={post.movieImage || "/placeholder.svg"} alt="Movie poster" fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-muted" />
                  <span className="font-bold">{post.user}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.content}</p>
                <div className="flex items-center gap-2 text-red-500">
                  <Heart className="h-5 w-5 fill-current" />
                  <span className="font-bold">{post.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Para ti Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Para ti</h2>
          <Button variant="link" className="text-primary">
            VER MÁS →
          </Button>
        </div>
        <div className="space-y-6">
          {mockRecommendations.map((post) => (
            <div key={post.id} className="flex gap-4 p-4 rounded-xl border-2 border-primary/30 bg-card">
              <div className="relative w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                <Image src={post.movieImage || "/placeholder.svg"} alt="Movie poster" fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-muted" />
                  <span className="font-bold">{post.user}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.content}</p>
                <div className="flex items-center gap-2 text-red-500">
                  <Heart className="h-5 w-5 fill-current" />
                  <span className="font-bold">{post.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
