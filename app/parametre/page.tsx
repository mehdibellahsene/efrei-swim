"use client"

import { useState } from "react"
import Header from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export default function ParametrePage() {
  const { toast } = useToast()
  const [theme, setTheme] = useState("light")
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState("fr")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // ...possibly update settings via Supabase or local storage...
    toast({
      title: "Paramètres mis à jour",
      description: "Vos options ont été enregistrées avec succès."
    })
  }

  return (
    <>
      <Header />
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
        <Card>
          <CardHeader>
            <CardTitle>Options de l'application</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Thème</Label>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notifications">Notifications</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                  <span>{notifications ? "Activées" : "Désactivées"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                </select>
              </div>
            </CardContent>
            <div className="p-6">
              <Button type="submit">Enregistrer les paramètres</Button>
            </div>
          </form>
        </Card>
      </main>
    </>
  )
}
