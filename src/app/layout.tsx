import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Toaster } from "react-hot-toast"
import { Providers } from "./providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Nexus Market - The Ultimate Gaming Marketplace",
  description:
    "Buy and sell gaming accounts, gift cards, game keys, in-game currency, and digital products. The ultimate gaming marketplace for gamers worldwide.",
  keywords: ["gaming", "marketplace", "gift cards", "game keys", "accounts", "digital products"],
  openGraph: {
    title: "Nexus Market - The Ultimate Gaming Marketplace",
    description: "Buy and sell gaming accounts, gift cards, game keys, and more.",
    type: "website",
    siteName: "Nexus Market",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Providers>
          <Header />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--card-bg)",
                color: "var(--foreground)",
                border: "1px solid var(--card-border)",
                backdropFilter: "blur(12px)",
              },
              success: {
                iconTheme: { primary: "#22c55e", secondary: "white" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "white" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
