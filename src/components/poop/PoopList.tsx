'use client'

import { useState } from 'react'
import { usePoopEntries } from '@/hooks/usePoopEntries'
import { groupByDay } from '@/lib/timeUtils'
import DayGroup from '@/components/shared/DayGroup'
import PoopEntryRow from './PoopEntryRow'
import PoopConfirmPopover from './PoopConfirmPopover'
import { PoopEntry } from '@/types'

interface PoopListProps {
  roomCode: string
  showPopover: boolean
  onClosePopover: () => void
}

export default function PoopList({
  roomCode,
  showPopover,
  onClosePopover,
}: PoopListProps) {
  const { entries, loading, addEntry, updateEntry, deleteEntry } =
    usePoopEntries(roomCode)
  const [editEntry, setEditEntry] = useState<PoopEntry | null>(null)
  const [showEditPopover, setShowEditPopover] = useState(false)

  const handleEdit = (entry: PoopEntry) => {
    setEditEntry(entry)
    setShowEditPopover(true)
  }

  const handleDelete = async (id: string) => {
    await deleteEntry(id)
  }

  const groups = groupByDay(entries)

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-muted rounded h-4 w-full"
          />
        ))}
      </div>
    )
  }

  return (
    <>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <p className="text-sm text-muted-foreground">
            No entries yet. Tap Add Diaper to get started.
          </p>
        </div>
      ) : (
        <div className="pb-28">
          {groups.map((group) => (
            <DayGroup key={group.date} label={group.label}>
              {group.entries.map((entry, entryIndex) => (
                <div key={entry.id}>
                  <PoopEntryRow
                    entry={entry}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                  {entryIndex < group.entries.length - 1 && (
                    <div className="h-px bg-border mx-4" />
                  )}
                </div>
              ))}
            </DayGroup>
          ))}
        </div>
      )}

      {/* Add popover */}
      <PoopConfirmPopover
        open={showPopover}
        onClose={onClosePopover}
        onConfirm={addEntry}
      />

      {/* Edit popover */}
      <PoopConfirmPopover
        open={showEditPopover}
        onClose={() => {
          setShowEditPopover(false)
          setEditEntry(null)
        }}
        onConfirm={addEntry}
        editEntry={editEntry}
        onUpdate={updateEntry}
      />
    </>
  )
}
