"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { checkAuthConfig } from "@/lib/auth-utils"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Add diagnostic check
        const authConfig = await checkAuthConfig();
        console.log("Auth configuration:", authConfig);
        setDebugInfo("Auth Config: " + JSON.stringify(authConfig, null, 2));

        console.log("Handling auth callback...");
        console.log("Full URL:", window.location.href);
        
        // Get both search params and hash fragments (Supabase sometimes uses hash fragments)
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
        
        // Check for errors first
        const searchError = searchParams.get('error');
        const hashError = hashParams.get('error');
        if ((searchError || hashError) && !searchParams.get('code') && !hashParams.get('code')) {
          const errorDescription = 
            searchParams.get('error_description') || 
            hashParams.get('error_description') || 
            'Unknown error';
            
          if (errorDescription.toLowerCase().includes('invalid') || errorDescription.toLowerCase().includes('expired')) {
            throw new Error("Lien de connexion invalide ou expiré. Veuillez demander un nouveau lien.");
          }
          throw new Error(`Auth redirect error: ${errorDescription}`);
        }
        
        // Try to get code from URL search params or hash fragment
        let code = searchParams.get('code') || hashParams.get('code');
        
        if (!code) {
          // Special handling for deep linking on mobile or unusual browser configurations
          // Look for code in any part of the URL as a last resort
          const fullUrl = window.location.href;
          const codeMatch = fullUrl.match(/code=([^&]+)/);
          if (codeMatch && codeMatch[1]) {
            code = codeMatch[1];
            console.log("Found code in URL match:", code.substring(0, 5) + "...");
          }
        }
        
        if (!code) {
          console.error("No auth code found in URL");
          const authConfigResult = await checkAuthConfig();
          setDebugInfo(`URL: ${window.location.href}\nSearch: ${window.location.search}\nHash: ${window.location.hash}\nAuth Config: ${JSON.stringify(authConfigResult, null, 2)}`);
          throw new Error("Aucun code d'authentification trouvé dans l'URL. Veuillez réessayer de vous connecter.");
        }
        
        console.log("Found auth code, exchanging for session...");
        
        // Explicitly exchange the auth code for a session
        const { data: exchangeData, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Code exchange error:", exchangeError);
          setDebugInfo(`Code: ${code.substring(0, 5)}***`);
          throw new Error(`Erreur lors de l'échange du code: ${exchangeError.message}`);
        }

        if (!exchangeData?.session) {
          console.error("No session returned from code exchange");
          setDebugInfo(`Exchange response: ${JSON.stringify(exchangeData)}`);
          throw new Error("Échec de création de session après échange de code. Réponse vide du serveur.");
        }

        console.log("Auth code exchanged successfully, verifying session...");

        // Explicitly set the session so that a cookie is written
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: exchangeData.session.access_token,
          refresh_token: exchangeData.session.refresh_token,
        });

        if (setSessionError) {
          console.error("Error setting session:", setSessionError);
          throw new Error(`Erreur lors de la persistance de session: ${setSessionError.message}`);
        }

        console.log("Authentication successful, session verified and persisted!");

        // Get the user data to check role
        const { data: { user } } = await supabase.auth.getUser();

        // Determine the correct redirect path based on user role
        let redirectPath = "/dashboard"; // Default path for all users

        // Check if user is an admin and set the redirect path
        if (user && (user.user_metadata?.role === 'admin' || user.email?.includes('@admin'))) {
          console.log("Admin user detected, redirecting to admin dashboard");
          redirectPath = "/admin/dashboard"; // Redirect admins to admin dashboard
        }

        // Authentication successful
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        })

        // Redirect to appropriate dashboard after successful authentication
        router.push(redirectPath);
      } catch (error: any) {
        console.error("Authentication error:", error);

        // Create a more informative error message
        let errorMessage = error.message || "Une erreur est survenue lors de la connexion.";

        // Add some browser environment information for debugging
        const browserInfo = {
          userAgent: navigator.userAgent,
          cookiesEnabled: navigator.cookieEnabled,
          localStorage: typeof localStorage !== 'undefined',
          protocol: window.location.protocol,
        };

        console.log("Browser environment:", browserInfo);

        // Check if there's a specific issue with cookies
        if (
          !navigator.cookieEnabled ||
          error.message?.includes('cookie') ||
          error.message?.includes('storage')
        ) {
          errorMessage = "Échec d'authentification: veuillez activer les cookies et le stockage local dans votre navigateur.";
        }

        setError(errorMessage);

        toast({
          title: "Erreur d'authentification",
          description: errorMessage,
          variant: "destructive",
        })

        // Redirect to login page after a delay if there's an error
        setTimeout(() => {
          router.push("/auth/login");
        }, 5000);
      } finally {
        setIsLoading(false)
      }
    }
    const timer = setTimeout(() => {
      handleAuthCallback()
    }, 500);
    
    return () => clearTimeout(timer);
  }, [router, toast])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p>Authentification en cours...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 text-red-500">
            <p>Erreur: {error}</p>
            {debugInfo && (
              <details className="mt-2 text-xs text-gray-500">
                <summary>Informations de débogage</summary>
                <pre className="mt-2 whitespace-pre-wrap text-left p-2 bg-gray-100 rounded">
                  {debugInfo}
                </pre>
              </details>
            )}
            <p>Redirection vers la page de connexion dans 5 secondes...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p>Authentification réussie!</p>
            <p>Redirection vers le tableau de bord...</p>
          </div>
        )}
      </div>
    </div>
  )
}
