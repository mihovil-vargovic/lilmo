'use client'

import { useState } from 'react'
import BottomSheet from '@/components/shared/BottomSheet'
import FullScreenSheet from '@/components/shared/FullScreenSheet'
import { Button } from '@/components/ui/button'
import { PoopEntry } from '@/types'

interface PoopSummaryModalProps {
  open: boolean
  onClose: () => void
  entries: PoopEntry[]
}

interface DaySummary {
  label: string
  total: number
  poopCount: number
  peeCount: number
  bothCount: number
}

function buildSummary(entries: PoopEntry[], date: Date, label: string): DaySummary {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const dayEntries = entries.filter((e) => {
    const t = new Date(e.logged_at)
    return t >= start && t <= end
  })

  return {
    label,
    total: dayEntries.length,
    poopCount: dayEntries.filter((e) => e.type === 'poop').length,
    peeCount: dayEntries.filter((e) => e.type === 'pee').length,
    bothCount: dayEntries.filter((e) => e.type === 'poop_and_pee').length,
  }
}

function getHistoryDays(entries: PoopEntry[]): Date[] {
  const seen = new Set<string>()
  const days: Date[] = []
  for (const e of entries) {
    const d = new Date(e.logged_at)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (!seen.has(key)) {
      seen.add(key)
      days.push(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
    }
  }
  return days
}

function formatDayLabel(date: Date): string {
  const today = new Date()
  const isCurrentYear = date.getFullYear() === today.getFullYear()
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    ...(!isCurrentYear ? { year: 'numeric' } : {}),
  })
}

function SummaryCard({ s, isToday }: { s: DaySummary; isToday?: boolean }) {
  const valueClass = isToday ? 'text-2xl font-semibold' : 'text-sm font-medium'

  return (
    <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{s.label}</span>
        <span className="text-xs text-muted-foreground">{s.total} diaper{s.total !== 1 ? 's' : ''}</span>
      </div>

      {s.total === 0 ? (
        <p className="text-xs text-muted-foreground">No entries</p>
      ) : (
        <div className="flex gap-4">
          {s.poopCount > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Poop</span>
              <span className={valueClass}>{s.poopCount}</span>
            </div>
          )}
          {s.peeCount > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Pee</span>
              <span className={valueClass}>{s.peeCount}</span>
            </div>
          )}
          {s.bothCount > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Both</span>
              <span className={valueClass}>{s.bothCount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function PoopSummaryModal({ open, onClose, entries }: PoopSummaryModalProps) {
  const [allHistoryOpen, setAllHistoryOpen] = useState(false)

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const todaySummary = buildSummary(entries, today, 'Today')
  const yesterdaySummary = buildSummary(entries, yesterday, 'Yesterday')
  const historyDays = getHistoryDays(entries)

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title="Summary"
        headerAction={
          <button
            onClick={() => setAllHistoryOpen(true)}
            className="text-sm font-medium text-foreground"
          >
            View all
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <SummaryCard s={todaySummary} isToday />
          <SummaryCard s={yesterdaySummary} />
          <Button variant="outline" className="w-full h-11 mt-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </BottomSheet>

      <FullScreenSheet
        open={allHistoryOpen}
        onClose={() => setAllHistoryOpen(false)}
        title="All history"
      >
        <div className="flex flex-col gap-3 pb-2">
          {historyDays.map((day) => {
            const label = formatDayLabel(day)
            const summary = buildSummary(entries, day, label)
            return <SummaryCard key={label} s={summary} />
          })}
          {historyDays.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No entries yet</p>
          )}
        </div>
      </FullScreenSheet>
    </>
  )
}
