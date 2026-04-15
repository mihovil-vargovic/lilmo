'use client'

import { useCountdown } from '@/hooks/useCountdown'
import { formatCountdown } from '@/lib/timeUtils'

interface NextFeedRowProps {
  loggedAt: string
}

const FEED_INTERVAL_MS = 3 * 60 * 60 * 1000
const HIDE_OVERDUE_AFTER_MS = 2 * 60 * 60 * 1000
const WARN_THRESHOLD_MS = 10 * 60 * 1000

const RADIUS = 7
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function CountdownRing({ progress, color }: { progress: number; color: 'blue' | 'orange' }) {
  const offset = CIRCUMFERENCE * (1 - progress)
  const trackClass = color === 'orange' ? 'text-orange-200' : 'text-blue-200'
  const progressClass = color === 'orange' ? 'text-orange-500' : 'text-blue-500'
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" className="shrink-0">
      <circle cx="9" cy="9" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="2" className={trackClass} />
      <circle cx="9" cy="9" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset} transform="rotate(-90 9 9)"
        className={`${progressClass} transition-all duration-1000`}
      />
    </svg>
  )
}

export default function NextFeedRow({ loggedAt }: NextFeedRowProps) {
  const nextFeedTime = new Date(loggedAt).getTime() + FEED_INTERVAL_MS
  const remaining = useCountdown(nextFeedTime)
  const isOverdue = remaining <= 0
  const overdueMs = isOverdue ? Math.abs(remaining) : 0

  if (isOverdue && overdueMs > HIDE_OVERDUE_AFTER_MS) return null

  const estimatedDate = isOverdue ? new Date() : new Date(Date.now() + remaining)
  const estimatedTime = estimatedDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const progress = isOverdue ? 0 : Math.min(1, remaining / FEED_INTERVAL_MS)
  const isWarning = !isOverdue && remaining <= WARN_THRESHOLD_MS

  const color = isOverdue ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-blue-500'
  const ringColor = isWarning ? 'orange' : 'blue'

  const label = isOverdue
    ? `Overdue for ${Math.floor(overdueMs / 60000)}m`
    : `Next in ${formatCountdown(remaining)}`

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-8 py-3.5 bg-background">
        <div className={`flex items-center gap-2.5 ${color}`}>
          <span className="text-sm font-semibold tabular-nums">
            {estimatedTime}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-normal">{label}</span>
            {!isOverdue && <CountdownRing progress={progress} color={ringColor} />}
          </div>
        </div>
      </div>
      <div className="h-px bg-border mx-4 md:mx-8 border-dashed" style={{ borderTop: '1px dashed', borderColor: 'hsl(var(--border))' }} />
    </>
  )
}
