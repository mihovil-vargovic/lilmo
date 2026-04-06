'use client'

import { useState, useEffect } from 'react'
import BottomSheet from '@/components/shared/BottomSheet'
import TimePicker from '@/components/shared/TimePicker'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { roundToNearest5 } from '@/lib/timeUtils'
import { PoopType, PoopEntry } from '@/types'
import { toast } from 'sonner'

interface PoopConfirmPopoverProps {
  open: boolean
  onClose: () => void
  onConfirm: (loggedAt: Date, type: PoopType) => Promise<void>
  editEntry?: PoopEntry | null
  onUpdate?: (id: string, loggedAt: Date) => Promise<void>
}

const POOP_TYPE_OPTIONS: { value: PoopType; label: string }[] = [
  { value: 'poop_and_pee', label: 'Both' },
  { value: 'poop', label: 'Poop' },
  { value: 'pee', label: 'Pee' },
]

const STORAGE_KEY = 'lilmo_last_poop_type'

export default function PoopConfirmPopover({
  open,
  onClose,
  onConfirm,
  editEntry,
  onUpdate,
}: PoopConfirmPopoverProps) {
  const [time, setTime] = useState<Date>(roundToNearest5(new Date()))
  const [selectedType, setSelectedType] = useState<PoopType>('poop_and_pee')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (editEntry) {
        setTime(new Date(editEntry.logged_at))
        setSelectedType(editEntry.type)
      } else {
        setTime(roundToNearest5(new Date()))
        const last = localStorage.getItem(STORAGE_KEY) as PoopType | null
        setSelectedType(last || 'poop_and_pee')
      }
    }
  }, [open, editEntry])

  const handleConfirm = async () => {
    setSaving(true)
    try {
      if (editEntry && onUpdate) {
        await onUpdate(editEntry.id, time)
      } else {
        localStorage.setItem(STORAGE_KEY, selectedType)
        await onConfirm(time, selectedType)
      }
      onClose()
    } catch (e) {
      console.error(e)
      toast.error('Could not save entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editEntry ? 'Edit diaper' : 'Add diaper'}
    >
      <div className="space-y-7">
        {/* Type selection — only when adding */}
        {!editEntry && (
          <Tabs
            value={selectedType}
            onValueChange={(v) => setSelectedType(v as PoopType)}
          >
            <TabsList className="w-full">
              {POOP_TYPE_OPTIONS.map((opt) => (
                <TabsTrigger
                  key={opt.value}
                  value={opt.value}
                  className="flex-1 text-sm"
                >
                  <span>{opt.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Time picker */}
        <div className="flex items-center justify-center py-2">
          <TimePicker value={time} onChange={setTime} />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 h-11"
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
