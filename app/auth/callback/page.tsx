"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash and search params
        const hash = window.location.hash
        const searchParams = new URLSearchParams(window.location.search)
        
        console.log("Handling auth callback...");
        console.log("URL params:", window.location.search);
        
        // Only throw error if there is an error AND no auth code
        if (searchParams.get('error') && !searchParams.get('code')) {
          const errorDescription = searchParams.get('error_description') || 'Unknown error';
          // Custom error message for expired/invalid email link
          if (errorDescription.toLowerCase().includes('invalid') || errorDescription.toLowerCase().includes('expired')) {
            throw new Error("Lien de connexion invalide ou expiré. Veuillez demander un nouveau lien.");
          }
          throw new Error(`Auth redirect error: ${errorDescription}`);
        }
        
        // Get current session
        const { data: initialSessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        
        // Check if we already have a valid session
        if (initialSessionData.session) {
          console.log("Active session found, proceeding to dashboard");
          toast({
            title: "Connexion réussie",
            description: "Vous êtes maintenant connecté.",
          });
          router.push("/dashboard");
          return;
        }
        
        console.log("No active session found, checking for auth code...");
        
        // Try to exchange auth code if present in URL
        const code = searchParams.get('code');
        if (!code) {
          console.error("No auth code found in URL");
          setDebugInfo(`URL: ${window.location.href}, Params: ${JSON.stringify(Object.fromEntries(searchParams))}`);
          throw new Error("Aucun code d'authentification trouvé dans l'URL. Veuillez réessayer de vous connecter.");
        }
        
        // Explicitly exchange the auth code for a session
        console.log("Exchanging auth code for session...");
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
        
        // Verify the session was created
        const { data: verifyData } = await supabase.auth.getSession();
        
        if (!verifyData.session) {
          console.error("Session verification failed - no session found after exchange");
          // Try to debug what's happening with local storage
          let storageDebug = "Storage inaccessible";
          try {
            const storageKeys = Object.keys(localStorage).filter(key => 
              key.includes('supabase') || key.includes('auth'));
            storageDebug = `Available storage keys: ${storageKeys.join(', ')}`;
          } catch (e) {
            storageDebug = `Storage error: ${e instanceof Error ? e.message : 'unknown'}`;
          }
          
          setDebugInfo(storageDebug);
          throw new Error("Session créée mais non persistée. Problème possible avec les cookies ou le stockage local.");
        }
        
        console.log("Authentication successful, session verified!");

        // Authentication successful
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        })

        // Redirect to dashboard after successful authentication
        router.push("/dashboard")
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

    handleAuthCallback()
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
