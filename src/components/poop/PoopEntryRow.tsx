'use client'

import SwipeableRow from '@/components/shared/SwipeableRow'
import { PoopEntry, PoopType } from '@/types'

interface PoopEntryRowProps {
  entry: PoopEntry
  onEdit: (entry: PoopEntry) => void
  onDelete: (id: string) => void
}

const TYPE_CONFIG: Record<PoopType, { label: string }> = {
  poop: {
    label: 'Poop',
  },
  pee: {
    label: 'Pee',
  },
  poop_and_pee: {
    label: 'Both',
  },
}

export default function PoopEntryRow({
  entry,
  onEdit,
  onDelete,
}: PoopEntryRowProps) {
  const date = new Date(entry.logged_at)
  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const config = TYPE_CONFIG[entry.type]

  return (
    <SwipeableRow
      onEdit={() => onEdit(entry)}
      onDelete={() => onDelete(entry.id)}
    >
      <div className="flex items-center justify-between px-4 md:px-8 py-3.5 bg-background">
        <span className="text-sm font-semibold tabular-nums">
          {time}
        </span>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {config.label}
        </span>
      </div>
    </SwipeableRow>
  )
}
