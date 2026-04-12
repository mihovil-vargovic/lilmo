'use client'

import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { PoopEntry, PoopType } from '@/types'

const cache = new Map<string, PoopEntry[]>()

export function usePoopEntries(roomCode: string) {
  const [entries, setEntries] = useState<PoopEntry[]>(() => cache.get(roomCode) ?? [])
  const [loading, setLoading] = useState(() => !cache.has(roomCode))

  useEffect(() => {
    if (!roomCode) return

    const fetchEntries = () =>
      supabase
        .from('poop_entries')
        .select('*')
        .eq('room_code', roomCode)
        .order('logged_at', { ascending: false })
        .then(({ data }) => {
          if (data) {
            setEntries((prev) => {
              const merged = [...data]
              prev.forEach((e) => {
                if (!merged.some((m) => m.id === e.id)) merged.push(e)
              })
              merged.sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
              cache.set(roomCode, merged)
              return merged
            })
          }
          setLoading(false)
        })

    // Initial fetch
    fetchEntries()

    // Refetch when user returns to the app (covers background suspension & reconnect)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchEntries()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Real-time subscription
    const channel = supabase
      .channel(`poop_entries:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'poop_entries',
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEntry = payload.new as PoopEntry
            setEntries((prev) => {
              if (prev.some((e) => e.id === newEntry.id)) return prev
              const updated = [newEntry, ...prev]
              updated.sort(
                (a, b) =>
                  new Date(b.logged_at).getTime() -
                  new Date(a.logged_at).getTime()
              )
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setEntries((prev) =>
              prev.filter((e) => e.id !== payload.old.id)
            )
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as PoopEntry
            setEntries((prev) => {
              const next = prev.map((e) => (e.id === updated.id ? updated : e))
              next.sort(
                (a, b) =>
                  new Date(b.logged_at).getTime() -
                  new Date(a.logged_at).getTime()
              )
              return next
            })
          }
        }
      )
      .subscribe()

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      supabase.removeChannel(channel)
    }
  }, [roomCode])

  const addEntry = async (loggedAt: Date, type: PoopType) => {
    const now = new Date()
    const id = uuidv4()
    const newEntry: PoopEntry = {
      id,
      room_code: roomCode,
      type,
      logged_at: loggedAt.toISOString(),
      created_at: now.toISOString(),
    }

    // Optimistic update
    setEntries((prev) => {
      const updated = [newEntry, ...prev]
      updated.sort(
        (a, b) =>
          new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
      )
      return updated
    })

    const { error } = await supabase.from('poop_entries').insert({
      id,
      room_code: roomCode,
      type,
      logged_at: loggedAt.toISOString(),
    })

    if (error) {
      setEntries((prev) => prev.filter((e) => e.id !== id))
      throw error
    }
  }

  const updateEntry = async (id: string, loggedAt: Date) => {
    const { error } = await supabase
      .from('poop_entries')
      .update({ logged_at: loggedAt.toISOString() })
      .eq('id', id)
    if (error) throw error
  }

  const deleteEntry = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    const { error } = await supabase
      .from('poop_entries')
      .delete()
      .eq('id', id)
    if (error) {
      supabase
        .from('poop_entries')
        .select('*')
        .eq('room_code', roomCode)
        .order('logged_at', { ascending: false })
        .then(({ data }) => {
          if (data) setEntries(data)
        })
      throw error
    }
  }

  return { entries, loading, addEntry, updateEntry, deleteEntry }
}
