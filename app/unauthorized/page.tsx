"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ShieldAlertIcon } from "lucide-react"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-full mb-6">
        <ShieldAlertIcon className="h-24 w-24 text-red-500 dark:text-red-400" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        You do not have permission to access this area. This section is restricted to administrators only.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Button variant="default" onClick={() => router.push("/")}>
          Return to Home
        </Button>
        <Button variant="outline" onClick={() => router.push("/auth/login")}>
          Login with Different Account
        </Button>
      </div>
    </div>
  )
}
