'use client'

import BottomSheet from '@/components/shared/BottomSheet'
import { Button } from '@/components/ui/button'
import { FeedEntry } from '@/types'

interface FeedSummaryModalProps {
  open: boolean
  onClose: () => void
  entries: FeedEntry[]
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getDayLabel(date: Date, today: Date): string {
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

interface DaySummary {
  label: string
  total: number
  boobiesCount: number
  bottleCount: number
  boobiesMinutes: number
  bottleMl: number
}

function buildSummary(entries: FeedEntry[], date: Date, today: Date): DaySummary {
  const dayEntries = entries.filter((e) => isSameDay(new Date(e.logged_at), date))
  const boobies = dayEntries.filter((e) => e.feed_type === 'boobies')
  const bottle = dayEntries.filter((e) => e.feed_type === 'bottle')
  return {
    label: getDayLabel(date, today),
    total: dayEntries.length,
    boobiesCount: boobies.length,
    bottleCount: bottle.length,
    boobiesMinutes: boobies.reduce((s, e) => s + (e.duration_minutes ?? 0), 0),
    bottleMl: bottle.reduce((s, e) => s + (e.amount_ml ?? 0), 0),
  }
}

function SummaryCard({ s, isToday }: { s: DaySummary; isToday?: boolean }) {
  const boobiesPct = s.total > 0 ? Math.round((s.boobiesCount / s.total) * 100) : 0
  const bottlePct = s.total > 0 ? 100 - boobiesPct : 0
  const valueClass = isToday ? 'text-2xl font-semibold' : 'text-sm font-medium pl-3.5'
  const labelClass = isToday ? 'text-xs text-muted-foreground' : 'text-xs text-muted-foreground'

  return (
    <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{s.label}</span>
        <span className="text-xs text-muted-foreground">{s.total} feeding{s.total !== 1 ? 's' : ''}</span>
      </div>

      {s.total === 0 ? (
        <p className="text-xs text-muted-foreground">No entries</p>
      ) : (
        <>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden flex">
            <div className="h-full bg-pink-400 rounded-l-full" style={{ width: `${boobiesPct}%` }} />
            <div className="h-full bg-blue-400 rounded-r-full" style={{ width: `${bottlePct}%` }} />
          </div>

          <div className="flex gap-4">
            {s.boobiesCount > 0 && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-400 shrink-0" />
                  <span className="text-xs text-muted-foreground">Boobies {boobiesPct}%</span>
                </div>
                <span className={valueClass}>{s.boobiesMinutes} min total</span>
              </div>
            )}
            {s.bottleCount > 0 && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-xs text-muted-foreground">Bottle {bottlePct}%</span>
                </div>
                <span className={valueClass}>{s.bottleMl} ml total</span>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  )
}

export default function FeedSummaryModal({ open, onClose, entries }: FeedSummaryModalProps) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const todaySummary = buildSummary(entries, today, today)
  const yesterdaySummary = buildSummary(entries, yesterday, today)

  return (
    <BottomSheet open={open} onClose={onClose} title="Summary">
      <div className="flex flex-col gap-3">
        <SummaryCard s={todaySummary} isToday />
        <SummaryCard s={yesterdaySummary} />
        <Button variant="outline" className="w-full h-11 mt-1" onClick={onClose}>
          Close
        </Button>
      </div>
    </BottomSheet>
  )
}
