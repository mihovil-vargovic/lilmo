'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check localStorage first, then fall back to cookie
    let code = localStorage.getItem('lilmo_room')
    if (!code) {
      const match = document.cookie.match(/(?:^|;\s*)lilmo_room=([^;]+)/)
      if (match) {
        code = match[1]
        localStorage.setItem('lilmo_room', code) // restore localStorage from cookie
      }
    }
    if (code) {
      router.replace(`/room/${code}/feed`)
    } else {
      router.replace('/join')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
