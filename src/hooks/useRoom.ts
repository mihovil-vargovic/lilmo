'use client'

import { useEffect, useState } from 'react'

export function useRoom(): { roomCode: string | null } {
  const [roomCode, setRoomCode] = useState<string | null>(null)

  useEffect(() => {
    const code = localStorage.getItem('lilmo_room')
    setRoomCode(code)
  }, [])

  return { roomCode }
}
