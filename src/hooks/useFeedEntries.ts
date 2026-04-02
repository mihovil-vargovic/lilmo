'use client'

import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import { FeedEntry } from '@/types'

export function useFeedEntries(roomCode: string) {
  const [entries, setEntries] = useState<FeedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const entriesRef = useRef<FeedEntry[]>([])

  useEffect(() => {
    entriesRef.current = entries
  }, [entries])

  useEffect(() => {
    if (!roomCode) return

    // Initial fetch
    supabase
      .from('feed_entries')
      .select('*')
      .eq('room_code', roomCode)
      .order('logged_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setEntries(data)
        }
        setLoading(false)
      })

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
      supabase.removeChannel(channel)
    }
  }, [roomCode])

  const addEntry = async (loggedAt: Date, feedType: 'bottle' | 'boobies' = 'bottle', durationMinutes?: number, amountMl?: number) => {
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)

    // Check for duplicate within 1 minute window by created_at
    const current = entriesRef.current
    const duplicate = current.find((e) => {
      const createdAt = new Date(e.created_at)
      return createdAt >= oneMinuteAgo && createdAt <= now
    })
    if (duplicate) return

    const id = uuidv4()
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

  return { entries, loading, addEntry, updateEntry, deleteEntry }
}
