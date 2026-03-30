'use client'

import { useEffect, useState } from 'react'

export function useCountdown(targetMs: number): number {
  const [remaining, setRemaining] = useState<number>(targetMs - Date.now())

  useEffect(() => {
    setRemaining(targetMs - Date.now())

    const interval = setInterval(() => {
      setRemaining(targetMs - Date.now())
    }, 30000)

    return () => clearInterval(interval)
  }, [targetMs])

  return remaining
}
