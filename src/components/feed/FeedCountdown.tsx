'use client'

import { useCountdown } from '@/hooks/useCountdown'
import { formatCountdown } from '@/lib/timeUtils'

interface FeedCountdownProps {
  loggedAt: string
}

const FEED_INTERVAL_MS = 3 * 60 * 60 * 1000 // 3 hours

export default function FeedCountdown({ loggedAt }: FeedCountdownProps) {
  const nextFeedTime = new Date(loggedAt).getTime() + FEED_INTERVAL_MS
  const remaining = useCountdown(nextFeedTime)
  const isOverdue = remaining <= 0

  return (
    <span
      className={isOverdue ? 'text-sm font-medium text-destructive' : 'text-sm text-muted-foreground'}
    >
      {isOverdue ? 'Feed now' : `Next in ${formatCountdown(remaining)}`}
    </span>
  )
}
