'use client'

import { useCountdown } from '@/hooks/useCountdown'
import { formatCountdown } from '@/lib/timeUtils'

interface FeedCountdownProps {
  loggedAt: string
  isLatest: boolean
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
    <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
      <circle
        cx="9" cy="9" r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={trackClass}
      />
      <circle
        cx="9" cy="9" r={RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform="rotate(-90 9 9)"
        className={`${progressClass} transition-all duration-1000`}
      />
    </svg>
  )
}

export default function FeedCountdown({ loggedAt, isLatest }: FeedCountdownProps) {
  const nextFeedTime = new Date(loggedAt).getTime() + FEED_INTERVAL_MS
  const remaining = useCountdown(nextFeedTime)
  const isOverdue = remaining <= 0
  const overdueMs = isOverdue ? Math.abs(remaining) : 0

  if (!isLatest) return null
  if (isOverdue && overdueMs > HIDE_OVERDUE_AFTER_MS) return null

  const progress = isOverdue ? 0 : Math.min(1, remaining / FEED_INTERVAL_MS)

  if (isOverdue) {
    const overdueMins = Math.floor(overdueMs / 60000)
    const overdueLabel = overdueMins > 0 ? `Overdue for ${overdueMins}m` : 'Overdue'
    return (
      <span className="text-xs font-medium text-red-500">
        {overdueLabel}
      </span>
    )
  }

  const isWarning = remaining <= WARN_THRESHOLD_MS
  const color = isWarning ? 'orange' : 'blue'
  const textClass = isWarning ? 'text-orange-500' : 'text-blue-500'

  return (
    <div className={`flex items-center gap-1.5 ${textClass}`}>
      <span className="text-xs font-medium">
        Next in {formatCountdown(remaining)}
      </span>
      <CountdownRing progress={progress} color={color} />
    </div>
  )
}
