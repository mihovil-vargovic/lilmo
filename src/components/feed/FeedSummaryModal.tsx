'use client'

import { useState } from 'react'
import BottomSheet from '@/components/shared/BottomSheet'
import FullScreenSheet from '@/components/shared/FullScreenSheet'
import { Button } from '@/components/ui/button'
import { FeedEntry, PoopEntry } from '@/types'

interface FeedSummaryModalProps {
  open: boolean
  onClose: () => void
  entries: FeedEntry[]
  poopEntries?: PoopEntry[]
}

interface DaySummary {
  label: string
  total: number
  boobiesCount: number
  bottleCount: number
  boobiesMinutes: number
  bottleMl: number
}

function buildPoopCount(entries: PoopEntry[], date: Date): number {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return entries.filter((e) => {
    const t = new Date(e.logged_at)
    return t >= start && t <= end && (e.type === 'poop' || e.type === 'poop_and_pee')
  }).length
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

function getHistoryDays(entries: FeedEntry[]): Date[] {
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
  return days // already newest-first since entries are sorted desc
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

function FoodIcon() {
  return (
    <span className="inline-flex items-center justify-center mx-1 shrink-0 translate-y-[5px]" style={{ width: '1.05em', height: '1.05em' }}>
      <svg viewBox="0 0 25.8008 25.459" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <path d="M25.4395 12.7246C25.4395 19.7266 19.7266 25.4395 12.7148 25.4395C5.71289 25.4395 0 19.7266 0 12.7246C0 5.71289 5.71289 0 12.7148 0C19.7266 0 25.4395 5.71289 25.4395 12.7246ZM9.44336 4.75586L9.375 9.24805C9.375 9.49219 9.19922 9.6582 8.95508 9.6582C8.73047 9.6582 8.55469 9.49219 8.55469 9.23828L8.60352 4.87305C8.60352 4.55078 8.44727 4.36523 8.1543 4.36523C7.86133 4.36523 7.68555 4.54102 7.66602 4.86328L7.46094 9.33594C7.40234 10.6152 7.79297 11.0645 8.76953 11.4844C8.99414 11.5918 9.0918 11.7773 9.0918 12.0312L8.95508 20.2637C8.93555 20.8496 9.33594 21.1816 9.92188 21.1816C10.5176 21.1816 10.9082 20.8496 10.8984 20.2637L10.7617 12.0312C10.7617 11.7773 10.8594 11.5918 11.0938 11.4844C12.0508 11.0645 12.4512 10.6152 12.3926 9.33594L12.168 4.86328C12.1484 4.54102 11.9922 4.36523 11.6992 4.36523C11.4062 4.36523 11.2402 4.55078 11.2402 4.87305L11.2891 9.23828C11.2891 9.49219 11.123 9.6582 10.8887 9.6582C10.6348 9.6582 10.459 9.49219 10.459 9.24805L10.4102 4.75586C10.4102 4.44336 10.2051 4.27734 9.92188 4.27734C9.63867 4.27734 9.44336 4.44336 9.44336 4.75586ZM15.7227 4.73633C14.541 6.38672 13.7793 9.43359 13.7793 12.4121V12.9199C13.7793 13.4473 13.9746 13.7988 14.3359 14.0625L14.7266 14.3457C14.9902 14.5215 15.1074 14.7363 15.0977 15.0488L14.9219 20.1953C14.9023 20.8496 15.3125 21.1816 15.8887 21.1816C16.5039 21.1816 16.8945 20.8691 16.8945 20.2832V4.79492C16.8945 4.42383 16.6406 4.27734 16.3867 4.27734C16.1328 4.27734 15.9473 4.41406 15.7227 4.73633Z" fill="currentColor"/>
      </svg>
    </span>
  )
}

function ToiletIcon() {
  return (
    <span className="inline-flex items-center justify-center mx-1 shrink-0 translate-y-[5px]" style={{ width: '1.05em', height: '1.05em' }}>
      <svg viewBox="0 0 25.8008 25.459" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <path d="M25.4395 12.7344C25.4395 19.7461 19.7266 25.459 12.7148 25.459C5.71289 25.459 0 19.7461 0 12.7344C0 5.73242 5.71289 0.0195312 12.7148 0.0195312C19.7266 0.0195312 25.4395 5.73242 25.4395 12.7344ZM12.9297 18.0566H12.5C11.6602 18.0566 10.8203 17.8906 10.0977 17.5781L9.39453 19.9121C9.31641 20.1758 9.32617 20.4004 9.50195 20.5859C10.127 21.1719 11.5625 21.4746 12.7246 21.4746C13.8867 21.4746 15.3223 21.1719 15.9375 20.5859C16.123 20.4004 16.123 20.1758 16.0547 19.9121L15.3516 17.5586C14.6289 17.8906 13.7793 18.0566 12.9297 18.0566ZM12.5195 17.2949H12.9297C15.2051 17.2949 16.9531 16.0254 17.4121 13.8672C16.4648 14.5312 14.7949 14.9023 12.7344 14.9023C10.6836 14.9023 8.99414 14.5312 8.03711 13.8574C8.48633 16.0254 10.2441 17.2949 12.5195 17.2949ZM7.91992 12.4023C7.91992 13.4375 9.95117 14.1602 12.7344 14.1602C15.5371 14.1602 17.5293 13.4375 17.5293 12.4023C17.5293 11.377 15.5078 10.6543 12.7344 10.6543C9.95117 10.6543 7.91992 11.377 7.91992 12.4023ZM16.0645 12.4023C16.0645 12.8027 14.7754 13.1152 12.7344 13.1152C10.6836 13.1152 9.38477 12.8027 9.38477 12.4023C9.38477 12.0117 10.6836 11.7188 12.7344 11.7188C14.7754 11.7188 16.0645 12.0117 16.0645 12.4023ZM8.51562 6.63086L8.81836 10.5176C9.79492 10.1172 11.1621 9.89258 12.7344 9.89258C14.3066 9.89258 15.6738 10.1172 16.6406 10.5176L16.9336 6.63086H8.51562ZM8.4668 4.85352C8.18359 4.85352 7.94922 5.08789 7.94922 5.36133C7.94922 5.6543 8.18359 5.86914 8.4668 5.86914H16.9824C17.2656 5.86914 17.5 5.6543 17.5 5.36133C17.5 5.08789 17.2656 4.85352 16.9824 4.85352H8.4668Z" fill="currentColor"/>
      </svg>
    </span>
  )
}

function TodayCard({ s, poopCount }: { s: DaySummary; poopCount: number }) {
  const hasBottle = s.bottleMl > 0
  const hasBoobies = s.boobiesMinutes > 0
  const hasPoop = poopCount > 0
  const boobiesPct = s.total > 0 ? Math.round((s.boobiesCount / s.total) * 100) : 0
  const bottlePct = s.total > 0 ? 100 - boobiesPct : 0

  return (
    <div className="rounded-xl border border-border p-3 flex flex-col gap-4">
      <div>
        <span className="inline-block text-xs font-medium bg-muted text-foreground px-2.5 py-1 rounded-lg mb-3">
          Daily progress
        </span>

        {s.total === 0 && !hasPoop ? (
          <p className="text-xl text-muted-foreground">Nothing logged today yet.</p>
        ) : (
          <p className="text-[18px] leading-[26px]">
            {s.total > 0 && (
              <>
                Lilmo had <FoodIcon /><strong>{s.total}</strong> feeding{s.total !== 1 ? 's' : ''}
                {(hasBottle || hasBoobies) && (
                  <>
                    ,{' '}
                    {hasBottle && <><strong>{s.bottleMl}ml</strong> from the bottle</>}
                    {hasBottle && hasBoobies && ' and '}
                    {hasBoobies && <><strong>{s.boobiesMinutes} min</strong> on the boobies</>}
                  </>
                )}
                .
              </>
            )}
            {hasPoop && (
              <>
                {s.total > 0 ? ' He also pooped ' : 'He pooped '}
                <ToiletIcon /><strong>{poopCount}</strong> time{poopCount !== 1 ? 's' : ''}, making dad very proud.
              </>
            )}
          </p>
        )}
      </div>

      {s.total > 0 && (
        <div className="flex flex-col gap-3 pt-3 border-t border-border">
          <HalftoneBar boobiesPct={boobiesPct} bottlePct={bottlePct} uid="today" />
          <div className="flex gap-4">
            {s.boobiesCount > 0 && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#111] shrink-0" />
                  <span className="text-xs text-muted-foreground">Boobies total</span>
                </div>
                <span className="text-[20px] font-semibold">{s.boobiesMinutes} min</span>
              </div>
            )}
            {s.bottleCount > 0 && (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#888] shrink-0" />
                  <span className="text-xs text-muted-foreground">Bottle total</span>
                </div>
                <span className="text-[20px] font-semibold">{s.bottleMl} ml</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
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
  const valueClass = isToday ? 'text-2xl font-semibold' : 'text-sm font-medium'
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

export default function FeedSummaryModal({ open, onClose, entries, poopEntries = [] }: FeedSummaryModalProps) {
  const [allHistoryOpen, setAllHistoryOpen] = useState(false)

  const today = new Date()

  const todaySummary = buildSummary(entries, today, 'Today')
  const todayPoopCount = buildPoopCount(poopEntries, today)

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
          <TodayCard s={todaySummary} poopCount={todayPoopCount} />
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
