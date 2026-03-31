'use client'

import { useCountdown } from '@/hooks/useCountdown'
import { formatCountdown } from '@/lib/timeUtils'

interface FeedCountdownProps {
  loggedAt: string
  isLatest: boolean
}

const FEED_INTERVAL_MS = 3 * 60 * 60 * 1000 // 3 hours
const HIDE_OVERDUE_AFTER_MS = 2 * 60 * 60 * 1000 // hide "Feed now" after 2h overdue

export default function FeedCountdown({ loggedAt, isLatest }: FeedCountdownProps) {
  const nextFeedTime = new Date(loggedAt).getTime() + FEED_INTERVAL_MS
  const remaining = useCountdown(nextFeedTime)
  const isOverdue = remaining <= 0
  const overdueMs = isOverdue ? Math.abs(remaining) : 0
  const hideOverdue = isOverdue && overdueMs > HIDE_OVERDUE_AFTER_MS

  // Only show countdown on the latest entry
  if (!isLatest) return null
  // Hide "Feed now" if overdue by more than 2 hours
  if (hideOverdue) return null

  return (
    <span
      className={isOverdue ? 'text-sm font-medium text-destructive' : 'text-sm text-muted-foreground'}
    >
      {isOverdue ? 'Feed now' : `Next in ${formatCountdown(remaining)}`}
    </span>
  )
}
