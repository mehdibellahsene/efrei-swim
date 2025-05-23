import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseAuthProvider } from "@/components/supabase-auth-provider"
import { RoleProvider } from "@/components/role-provider"
import { AuthProvider } from "@/components/auth-provider"
import { AdminShortcut } from "@/components/admin-shortcut"
import { AdminKeyboardShortcut } from "@/components/admin-keyboard-shortcut"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Efrei Swim",
  description: "Application de gestion de piscine",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Remove the theme script - your ThemeProvider will handle this */}
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <RoleProvider>
              <SupabaseAuthProvider>
                <AdminShortcut />
                <AdminKeyboardShortcut />
                {children}
                <Toaster />
              </SupabaseAuthProvider>
            </RoleProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}