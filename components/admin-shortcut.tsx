"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AdminShortcut() {
  const [keys, setKeys] = useState<string[]>([])
  const router = useRouter()
  
  // Secret admin access combination: Ctrl+Alt+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' && e.ctrlKey && e.altKey) {
        router.push('/admin/login')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [router])

  return null // This component doesn't render anything
}
