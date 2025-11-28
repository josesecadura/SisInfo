import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fylt",
  icons: {
    // Provide multiple sizes so browsers pick the most suitable one.
    icon: [
      { url: "/icon_app.png", sizes: "192x192", type: "image/png" },
      { url: "/icon_app-512.png", sizes: "512x512", type: "image/png" },
    ],
    // Optional apple touch icon
    apple: "/icon_app-152.png",
  },
  description: "Descubre películas, comparte reseñas y conecta con otros fans del cine",
  generator: "SisInf.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
