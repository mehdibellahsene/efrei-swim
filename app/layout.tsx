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
  title: "Efrei Swim Club",
  description: "Plateforme de gestion pour le club de natation de l'Efrei",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Theme script to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const getTheme = () => {
                    const storedTheme = localStorage.getItem('theme');
                    if (storedTheme) return storedTheme;
                    
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      return 'dark';
                    }
                    return 'light';
                  }

                  const theme = getTheme();
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {
                  // Fallback if localStorage is not available
                  console.error(e);
                }
              })();
            `,
          }}
        />
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