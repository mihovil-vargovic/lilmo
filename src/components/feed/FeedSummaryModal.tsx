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

function HalftoneBar({ boobiesPct, bottlePct, uid }: { boobiesPct: number; bottlePct: number; uid: string }) {
  const clipId = `clip-${uid}`
  const darkId = `lines-dark-${uid}`
  const lightId = `lines-light-${uid}`

  return (
    <svg width="100%" height="16" style={{ display: 'block' }}>
      <defs>
        <clipPath id={clipId}>
          <rect width="100%" height="16" rx="8" />
        </clipPath>
        {/* Dark: thick dense 45° lines — boobies */}
        <pattern id={darkId} x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="5" fill="#ffffff" />
          <line x1="0" y1="0" x2="0" y2="5" stroke="#111111" strokeWidth="3" />
        </pattern>
        {/* Light: thin sparse 45° lines — bottle */}
        <pattern id={lightId} x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="5" fill="#f0f0f0" />
          <line x1="0" y1="0" x2="0" y2="5" stroke="#aaaaaa" strokeWidth="1" />
        </pattern>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="100%" height="16" fill="#f0f0f0" />
        {boobiesPct > 0 && (
          <rect width={`${boobiesPct}%`} height="16" fill={`url(#${darkId})`} />
        )}
        {bottlePct > 0 && (
          <rect x={`${boobiesPct}%`} width={`${bottlePct}%`} height="16" fill={`url(#${lightId})`} />
        )}
      </g>
    </svg>
  )
}

function SummaryCard({ s, isToday }: { s: DaySummary; isToday?: boolean }) {
  const boobiesPct = s.total > 0 ? Math.round((s.boobiesCount / s.total) * 100) : 0
  const bottlePct = s.total > 0 ? 100 - boobiesPct : 0
  const valueClass = isToday ? 'text-2xl font-semibold' : 'text-sm font-medium pl-3.5'
  const uid = s.label.toLowerCase().replace(/\s+/g, '-')

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
          <HalftoneBar boobiesPct={boobiesPct} bottlePct={bottlePct} uid={uid} />

          <div className="flex gap-4">
            {s.boobiesCount > 0 && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#111] shrink-0" />
                  <span className="text-xs text-muted-foreground">Boobies total</span>
                </div>
                <span className={valueClass}>{s.boobiesMinutes} min</span>
              </div>
            )}
            {s.bottleCount > 0 && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#888] shrink-0" />
                  <span className="text-xs text-muted-foreground">Bottle total</span>
                </div>
                <span className={valueClass}>{s.bottleMl} ml</span>
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
