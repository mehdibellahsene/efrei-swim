"use client"

import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Cette page est introuvable</p>
      <Link href="/">
        <a className="text-blue-600 hover:underline">Retour à la page d'accueil</a>
      </Link>
    </div>
  )
}
