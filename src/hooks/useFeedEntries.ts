'use client'

import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { FeedEntry } from '@/types'

const cache = new Map<string, FeedEntry[]>()

export function useFeedEntries(roomCode: string) {
  const [entries, setEntries] = useState<FeedEntry[]>(() => cache.get(roomCode) ?? [])
  const [loading, setLoading] = useState(() => !cache.has(roomCode))
  const [latestAddedId, setLatestAddedId] = useState<string | null>(null)
  const latestAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!roomCode) return

    const fetchEntries = () =>
      supabase
        .from('feed_entries')
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
      .channel(`feed_entries:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feed_entries',
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEntry = payload.new as FeedEntry
            setEntries((prev) => {
              // Dedup: if id already exists, skip
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
            const updated = payload.new as FeedEntry
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

  const addEntry = async (loggedAt: Date, feedType: 'bottle' | 'boobies' = 'bottle', durationMinutes?: number, amountMl?: number) => {
    const now = new Date()
    const id = uuidv4()

    if (latestAddedTimer.current) clearTimeout(latestAddedTimer.current)
    setLatestAddedId(id)
    latestAddedTimer.current = setTimeout(() => setLatestAddedId(null), 600)

    const newEntry: FeedEntry = {
      id,
      room_code: roomCode,
      logged_at: loggedAt.toISOString(),
      created_at: now.toISOString(),
      feed_type: feedType,
      duration_minutes: durationMinutes,
      amount_ml: amountMl,
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

    const { error } = await supabase.from('feed_entries').insert({
      id,
      room_code: roomCode,
      logged_at: loggedAt.toISOString(),
      feed_type: feedType,
      duration_minutes: durationMinutes,
      amount_ml: amountMl,
    })

    if (error) {
      // Rollback optimistic update
      setEntries((prev) => prev.filter((e) => e.id !== id))
      throw error
    }
  }

  const updateEntry = async (
    id: string,
    loggedAt: Date,
    feedType?: 'bottle' | 'boobies',
    durationMinutes?: number,
    amountMl?: number
  ) => {
    const { error } = await supabase
      .from('feed_entries')
      .update({
        logged_at: loggedAt.toISOString(),
        ...(feedType !== undefined && { feed_type: feedType }),
        ...(durationMinutes !== undefined && { duration_minutes: durationMinutes }),
        ...(amountMl !== undefined && { amount_ml: amountMl }),
      })
      .eq('id', id)
    if (error) throw error
  }

  const deleteEntry = async (id: string) => {
    // Optimistic
    setEntries((prev) => prev.filter((e) => e.id !== id))
    const { error } = await supabase
      .from('feed_entries')
      .delete()
      .eq('id', id)
    if (error) {
      // Rollback: refetch
      supabase
        .from('feed_entries')
        .select('*')
        .eq('room_code', roomCode)
        .order('logged_at', { ascending: false })
        .then(({ data }) => {
          if (data) setEntries(data)
        })
      throw error
    }
  }

  return { entries, loading, addEntry, updateEntry, deleteEntry, latestAddedId }
}
