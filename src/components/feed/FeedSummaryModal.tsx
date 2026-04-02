'use client'

import BottomSheet from '@/components/shared/BottomSheet'
import { Button } from '@/components/ui/button'
import { FeedEntry } from '@/types'

interface FeedSummaryModalProps {
  open: boolean
  onClose: () => void
  entries: FeedEntry[]
}

interface DaySummary {
  label: string
  total: number
  boobiesCount: number
  bottleCount: number
  boobiesMinutes: number
  bottleMl: number
}

function buildSummary(entries: FeedEntry[], date: Date, label: string): DaySummary {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const dayEntries = entries.filter((e) => {
    const t = new Date(e.logged_at)
    return t >= start && t <= end
  })
  const boobies = dayEntries.filter((e) => e.feed_type === 'boobies')
  const bottle = dayEntries.filter((e) => e.feed_type === 'bottle')
  return {
    label,
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
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden flex">
            <div className="h-full bg-pink-400 rounded-l-full" style={{ width: `${boobiesPct}%` }} />
            <div className="h-full bg-blue-400 rounded-r-full" style={{ width: `${bottlePct}%` }} />
          </div>

          <div className="flex gap-4">
            {s.boobiesCount > 0 && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-400 shrink-0" />
                  <span className="text-xs text-muted-foreground">Boobies</span>
                </div>
                <span className={valueClass}>{s.boobiesMinutes} min total</span>
              </div>
            )}
            {s.bottleCount > 0 && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                  <span className="text-xs text-muted-foreground">Bottle</span>
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

  const todaySummary = buildSummary(entries, today, 'Today')
  const yesterdaySummary = buildSummary(entries, yesterday, 'Yesterday')

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
