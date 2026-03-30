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

  return (
    <SwipeableRow onEdit={() => onEdit(entry)} onDelete={() => onDelete(entry.id)}>
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0 bg-background">
        <span className="text-sm font-semibold tabular-nums">
          {time}
        </span>
        <FeedCountdown loggedAt={entry.logged_at} />
      </div>
    </SwipeableRow>
  )
}
