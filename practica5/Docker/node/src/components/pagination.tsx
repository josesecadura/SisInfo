"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const DOTS = "DOTS"

  const range = (start: number, end: number) => {
    const length = end - start + 1
    return Array.from({ length }, (_, idx) => start + idx)
  }

  // cuántas páginas mostrar a cada lado de la actual
  const siblingCount = 1
  const boundaryCount = 1

  const totalPageNumbers = siblingCount * 2 + boundaryCount * 2 + 3 // first, last, current

  let paginationRange: (number | string)[] = []

  if (totalPages <= totalPageNumbers) {
    paginationRange = range(1, totalPages)
  } else {
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const showLeftDots = leftSiblingIndex > boundaryCount + 2
    const showRightDots = rightSiblingIndex < totalPages - (boundaryCount + 1)

    if (!showLeftDots && showRightDots) {
      // Solo puntos a la derecha
      const leftRange = range(1, rightSiblingIndex + siblingCount)
      paginationRange = [...leftRange, DOTS, totalPages]
    } else if (showLeftDots && !showRightDots) {
      // Solo puntos a la izquierda
      const rightRange = range(leftSiblingIndex - siblingCount, totalPages)
      paginationRange = [1, DOTS, ...rightRange]
    } else if (showLeftDots && showRightDots) {
      // Puntos a ambos lados
      const middleRange = range(leftSiblingIndex, rightSiblingIndex)
      paginationRange = [1, DOTS, ...middleRange, DOTS, totalPages]
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {/* Botón anterior */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Botones numéricos */}
      {paginationRange.map((item, idx) => {
        if (item === DOTS) {
          return (
            <span key={`dots-${idx}`} className="px-2 text-muted-foreground select-none">
              …
            </span>
          )
        }

        const page = Number(item)
        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={
              currentPage === page
                ? "h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90"
                : "h-9 w-9 text-muted-foreground hover:text-foreground"
            }
          >
            {page}
          </Button>
        )
      })}

      {/* Botón siguiente */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
