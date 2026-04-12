'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { groupByDay } from '@/lib/timeUtils'
import DayGroup from '@/components/shared/DayGroup'
import FeedEntryRow from './FeedEntryRow'
import NextFeedRow from './NextFeedRow'
import FeedConfirmPopover from './FeedConfirmPopover'
import DeleteConfirmSheet from '@/components/shared/DeleteConfirmSheet'
import { FeedEntry } from '@/types'

interface FeedListProps {
  entries: FeedEntry[]
  loading: boolean
  addEntry: (loggedAt: Date, feedType: 'bottle' | 'boobies', durationMinutes?: number, amountMl?: number) => Promise<void>
  updateEntry: (id: string, loggedAt: Date, feedType: 'bottle' | 'boobies', durationMinutes?: number, amountMl?: number) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  showPopover: boolean
  onClosePopover: () => void
}

export default function FeedList({
  entries,
  loading,
  addEntry,
  updateEntry,
  deleteEntry,
  showPopover,
  onClosePopover,
}: FeedListProps) {
  const [editEntry, setEditEntry] = useState<FeedEntry | null>(null)
  const [showEditPopover, setShowEditPopover] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleEdit = (entry: FeedEntry) => {
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

  const handleUpdate = async (id: string, loggedAt: Date, feedType: 'bottle' | 'boobies', durationMinutes?: number, amountMl?: number) => {
    await updateEntry(id, loggedAt, feedType, durationMinutes, amountMl)
    toast('Entry updated', { style: { background: '#000', color: '#fff' } })
  }

  const groups = groupByDay(entries)
  const lastPastEntry = entries.find(e => new Date(e.logged_at) <= new Date())

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-muted rounded h-4 w-full" />
        ))}
      </div>
    )
  }

  return (
    <>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <p className="text-sm text-muted-foreground">
            No entries yet. Tap Add Food to get started.
          </p>
        </div>
      ) : (
        <div className="pb-28">
          {groups.map((group, groupIndex) => (
            <DayGroup key={group.date} label={group.label}>
              {groupIndex === 0 && lastPastEntry && (
                <NextFeedRow loggedAt={lastPastEntry.logged_at} />
              )}
              {group.entries.map((entry, entryIndex) => (
                <div key={entry.id}>
                  <FeedEntryRow
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

      <FeedConfirmPopover
        open={showPopover}
        onClose={onClosePopover}
        onConfirm={addEntry}
      />

      <FeedConfirmPopover
        open={showEditPopover}
        onClose={() => { setShowEditPopover(false); setEditEntry(null) }}
        onConfirm={addEntry}
        editEntry={editEntry}
        onUpdate={handleUpdate}
      />

      <DeleteConfirmSheet
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
