'use client'

import SwipeableRow from '@/components/shared/SwipeableRow'
import FeedCountdown from './FeedCountdown'
import { FeedEntry } from '@/types'

interface FeedEntryRowProps {
  entry: FeedEntry
  isLatest: boolean
  onEdit: (entry: FeedEntry) => void
  onDelete: (id: string) => void
}

export default function FeedEntryRow({
  entry,
  isLatest,
  onEdit,
  onDelete,
}: FeedEntryRowProps) {
  const date = new Date(entry.logged_at)
  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const feedLabel = entry.feed_type === 'boobies' ? 'Boobies' : 'Bottle'

  return (
    <SwipeableRow onEdit={() => onEdit(entry)} onDelete={() => onDelete(entry.id)}>
      <div className="flex items-center justify-between px-4 py-3.5 bg-background">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold tabular-nums">
            {time}
          </span>
          <FeedCountdown loggedAt={entry.logged_at} isLatest={isLatest} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground border border-dashed border-border px-2 py-0.5 rounded-full">
            {feedLabel}
          </span>
          {entry.feed_type === 'bottle' && entry.amount_ml != null && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {entry.amount_ml} ml
            </span>
          )}
          {entry.feed_type === 'boobies' && entry.duration_minutes != null && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {entry.duration_minutes}m
            </span>
          )}
        </div>
      </div>
    </SwipeableRow>
  )
}
