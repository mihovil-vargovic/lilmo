'use client'

import { useState, useEffect } from 'react'
import BottomSheet from '@/components/shared/BottomSheet'
import TimePicker from '@/components/shared/TimePicker'
import { Button } from '@/components/ui/button'
import { roundToNearest5 } from '@/lib/timeUtils'

interface FeedConfirmPopoverProps {
  open: boolean
  onClose: () => void
  onConfirm: (loggedAt: Date) => Promise<void>
  editEntry?: { id: string; logged_at: string } | null
  onUpdate?: (id: string, loggedAt: Date) => Promise<void>
}

export default function FeedConfirmPopover({
  open,
  onClose,
  onConfirm,
  editEntry,
  onUpdate,
}: FeedConfirmPopoverProps) {
  const [time, setTime] = useState<Date>(roundToNearest5(new Date()))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (editEntry) {
        setTime(new Date(editEntry.logged_at))
      } else {
        setTime(roundToNearest5(new Date()))
      }
    }
  }, [open, editEntry])

  const handleConfirm = async () => {
    setSaving(true)
    try {
      if (editEntry && onUpdate) {
        await onUpdate(editEntry.id, time)
      } else {
        await onConfirm(time)
      }
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editEntry ? 'Edit Feed' : 'Add Feed'}
    >
      <div className="space-y-8">
        <div className="flex items-center justify-center py-4">
          <TimePicker value={time} onChange={setTime} />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirm}
            disabled={saving}
          >
            {saving ? 'Saving…' : editEntry ? 'Update' : 'Confirm'}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
