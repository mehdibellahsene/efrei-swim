"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AdminKeyboardShortcut() {
  const router = useRouter()
  
  // Admin access keyboard shortcut (Ctrl+Alt+A)
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
