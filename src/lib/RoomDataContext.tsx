'use client'

import { createContext, useContext } from 'react'
import { useFeedEntries } from '@/hooks/useFeedEntries'
import { usePoopEntries } from '@/hooks/usePoopEntries'

type FeedHook = ReturnType<typeof useFeedEntries>
type PoopHook = ReturnType<typeof usePoopEntries>

const RoomDataContext = createContext<{ feed: FeedHook; poop: PoopHook } | null>(null)

export function RoomDataProvider({ code, children }: { code: string; children: React.ReactNode }) {
  const feed = useFeedEntries(code)
  const poop = usePoopEntries(code)
  return (
    <RoomDataContext.Provider value={{ feed, poop }}>
      {children}
    </RoomDataContext.Provider>
  )
}

export function useRoomData() {
  const ctx = useContext(RoomDataContext)
  if (!ctx) throw new Error('useRoomData must be used within RoomDataProvider')
  return ctx
}
