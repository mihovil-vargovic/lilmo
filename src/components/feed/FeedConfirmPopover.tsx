'use client'

import { useState, useEffect } from 'react'
import BottomSheet from '@/components/shared/BottomSheet'
import TimePicker from '@/components/shared/TimePicker'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { roundToNearest5 } from '@/lib/timeUtils'
import { cn } from '@/lib/utils'

interface FeedConfirmPopoverProps {
  open: boolean
  onClose: () => void
  onConfirm: (loggedAt: Date, feedType: 'bottle' | 'boobies', durationMinutes?: number) => Promise<void>
  editEntry?: { id: string; logged_at: string } | null
  onUpdate?: (id: string, loggedAt: Date) => Promise<void>
}

const DURATION_OPTIONS = [10, 15, 20, 25, 30]

export default function FeedConfirmPopover({
  open,
  onClose,
  onConfirm,
  editEntry,
  onUpdate,
}: FeedConfirmPopoverProps) {
  const [time, setTime] = useState<Date>(roundToNearest5(new Date()))
  const [saving, setSaving] = useState(false)
  const [feedType, setFeedType] = useState<'bottle' | 'boobies'>('bottle')
  const [durationMinutes, setDurationMinutes] = useState(15)

  useEffect(() => {
    if (open) {
      if (editEntry) {
        setTime(new Date(editEntry.logged_at))
      } else {
        setTime(roundToNearest5(new Date()))
      }
      setFeedType('bottle')
      setDurationMinutes(15)
    }
  }, [open, editEntry])

  const endsAt = new Date(time.getTime() + durationMinutes * 60 * 1000)
  const endsAtStr = endsAt.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleConfirm = async () => {
    setSaving(true)
    try {
      if (editEntry && onUpdate) {
        await onUpdate(editEntry.id, time)
      } else {
        await onConfirm(
          time,
          feedType,
          feedType === 'boobies' ? durationMinutes : undefined
        )
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
      title={editEntry ? 'Edit Food' : 'Add Food'}
    >
      <div className="space-y-6">
        {/* Segment control — only show when adding, not editing */}
        {!editEntry && (
          <Tabs
            value={feedType}
            onValueChange={(v) => setFeedType(v as 'bottle' | 'boobies')}
          >
            <TabsList className="w-full">
              <TabsTrigger value="bottle" className="flex-1">
                Bottle
              </TabsTrigger>
              <TabsTrigger value="boobies" className="flex-1">
                Boobies
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Bottle content */}
        {(editEntry || feedType === 'bottle') && (
          <div className="flex items-center justify-center py-4">
            <TimePicker value={time} onChange={setTime} />
          </div>
        )}

        {/* Boobies content */}
        {!editEntry && feedType === 'boobies' && (
          <div className="space-y-5">
            <div className="flex items-center justify-center py-4">
              <TimePicker value={time} onChange={setTime} />
            </div>

            {/* Duration tags */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">Duration</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {DURATION_OPTIONS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      durationMinutes === mins
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-background text-foreground'
                    )}
                  >
                    {mins}min
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Ends at {endsAtStr}
              </p>
            </div>
          </div>
        )}

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
