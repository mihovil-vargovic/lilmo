'use client'

import SwipeableRow from '@/components/shared/SwipeableRow'
import FeedCountdown from './FeedCountdown'
import { FeedEntry } from '@/types'

interface FeedEntryRowProps {
  entry: FeedEntry
  onEdit: (entry: FeedEntry) => void
  onDelete: (id: string) => void
}

export default function FeedEntryRow({
  entry,
  onEdit,
  onDelete,
}: FeedEntryRowProps) {
  const date = new Date(entry.logged_at)
  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const showDuration =
    entry.feed_type === 'boobies' && entry.duration_minutes != null

  return (
    <SwipeableRow onEdit={() => onEdit(entry)} onDelete={() => onDelete(entry.id)}>
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0 bg-background">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums">
            {time}
          </span>
          {showDuration && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {entry.duration_minutes} min
            </span>
          )}
        </div>
        <FeedCountdown loggedAt={entry.logged_at} />
      </div>
    </SwipeableRow>
  )
}
