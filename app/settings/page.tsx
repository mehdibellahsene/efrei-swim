"use client"

import Header from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <>
      <Header />
      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Contenu de la page de paramètres...</p>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
