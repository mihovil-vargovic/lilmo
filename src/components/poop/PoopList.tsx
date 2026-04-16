'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRoomData } from '@/lib/RoomDataContext'
import { groupByDay } from '@/lib/timeUtils'
import DayGroup from '@/components/shared/DayGroup'
import PoopEntryRow from './PoopEntryRow'
import PoopConfirmPopover from './PoopConfirmPopover'
import DeleteConfirmSheet from '@/components/shared/DeleteConfirmSheet'
import { PoopEntry, PoopType } from '@/types'

interface PoopListProps {
  showPopover: boolean
  onClosePopover: () => void
}

export default function PoopList({
  showPopover,
  onClosePopover,
}: PoopListProps) {
  const { poop: { entries, loading, addEntry, updateEntry, deleteEntry, latestAddedId } } = useRoomData()
  const [editEntry, setEditEntry] = useState<PoopEntry | null>(null)
  const [showEditPopover, setShowEditPopover] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleEdit = (entry: PoopEntry) => {
    setEditEntry(entry)
    setShowEditPopover(true)
  }

  const handleDelete = (id: string) => setDeleteId(id)

  const confirmDelete = async () => {
    if (!deleteId) return
    await deleteEntry(deleteId)
    setDeleteId(null)
    toast('Entry deleted', { style: { background: '#000', color: '#fff' } })
  }

  const handleUpdate = async (id: string, loggedAt: Date, type?: PoopType) => {
    await updateEntry(id, loggedAt, type)
    toast('Entry updated', { style: { background: '#000', color: '#fff' } })
  }

  const groups = groupByDay(entries)

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-4 space-y-3">
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
            No entries yet. Tap + Diaper to get started.
          </p>
        </div>
      ) : (
        <div className="pb-28">
          {groups.map((group) => (
            <DayGroup key={group.date} label={group.label}>
              {group.entries.map((entry, entryIndex) => (
                <div
                  key={entry.id}
                  className={entry.id === latestAddedId ? 'animate-entry-fade-in' : undefined}
                >
                  <PoopEntryRow
                    entry={entry}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                  {entryIndex < group.entries.length - 1 && (
                    <div className="h-px bg-border mx-4 md:mx-8" />
                  )}
                </div>
              ))}
            </DayGroup>
          ))}
        </div>
      )}

      <DeleteConfirmSheet
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

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
        onUpdate={handleUpdate}
      />
    </>
  )
}
