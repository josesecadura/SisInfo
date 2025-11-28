"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { UserHeader } from "@/components/user-header"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  return (
    <>
      {!isAdminRoute && <UserHeader />}
      {children}
    </>
  )
}
