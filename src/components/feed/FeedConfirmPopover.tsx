'use client'

import { useState, useEffect, useRef } from 'react'
import BottomSheet from '@/components/shared/BottomSheet'
import TimePicker from '@/components/shared/TimePicker'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { roundToNearest5 } from '@/lib/timeUtils'
import { cn } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'

interface FeedConfirmPopoverProps {
  open: boolean
  onClose: () => void
  onConfirm: (loggedAt: Date, feedType: 'bottle' | 'boobies', durationMinutes?: number, amountMl?: number) => Promise<void>
  editEntry?: { id: string; logged_at: string } | null
  onUpdate?: (id: string, loggedAt: Date) => Promise<void>
}

const DURATION_OPTIONS = [10, 15, 20, 25, 30]
const AMOUNT_OPTIONS = [5, 10, 20, 30, 40, 50, 60]

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
  const [amountMl, setAmountMl] = useState(20)
  const dateInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTime(editEntry ? new Date(editEntry.logged_at) : roundToNearest5(new Date()))
      setFeedType('bottle')
      setDurationMinutes(15)
      setAmountMl(20)
    }
  }, [open, editEntry])

  const toDateInputValue = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return
    const [y, m, d] = e.target.value.split('-').map(Number)
    const updated = new Date(time)
    updated.setFullYear(y, m - 1, d)
    setTime(updated)
  }

  const endsAt = new Date(time.getTime() + durationMinutes * 60 * 1000)
  const endsAtStr = endsAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const handleConfirm = async () => {
    setSaving(true)
    try {
      if (editEntry && onUpdate) {
        await onUpdate(editEntry.id, time)
      } else {
        await onConfirm(
          time,
          feedType,
          feedType === 'boobies' ? durationMinutes : undefined,
          feedType === 'bottle' ? amountMl : undefined
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
    <BottomSheet open={open} onClose={onClose} title={editEntry ? 'Edit food' : 'Add food'}>
      <div className="flex flex-col gap-6">

        {/* Segment control */}
        {!editEntry && (
          <Tabs value={feedType} onValueChange={(v) => setFeedType(v as 'bottle' | 'boobies')}>
            <TabsList className="w-full">
              <TabsTrigger value="bottle" className="flex-1">Bottle</TabsTrigger>
              <TabsTrigger value="boobies" className="flex-1">Boobies</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Time picker — shared, always visible */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
          <TimePicker value={time} onChange={setTime} />
          <div className="relative w-11 h-11">
            <div className="w-11 h-11 flex items-center justify-center rounded-full border border-border text-muted-foreground pointer-events-none">
              <CalendarDays className="w-5 h-5" />
            </div>
            <input
              ref={dateInputRef}
              type="date"
              value={toDateInputValue(time)}
              onChange={handleDateChange}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
          </div>
        </div>

        {/* Options — overlapping grid so height never shifts */}
        {!editEntry && (
          <div className="grid w-full min-w-0">
            {/* Bottle: amount */}
            <div className={cn(
              'col-start-1 row-start-1 flex flex-col items-center gap-3 w-full min-w-0',
              feedType !== 'bottle' && 'invisible pointer-events-none'
            )}>
              <p className="text-sm text-muted-foreground">Amount</p>
              <div className="flex gap-2 overflow-x-auto w-full pb-1 scrollbar-none [touch-action:pan-x]">
                {AMOUNT_OPTIONS.map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    onClick={() => setAmountMl(ml)}
                    className={cn(
                      'flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      amountMl === ml
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-background text-foreground'
                    )}
                  >
                    {ml}ml
                  </button>
                ))}
              </div>
            </div>

            {/* Boobies: duration */}
            <div className={cn(
              'col-start-1 row-start-1 flex flex-col items-center gap-3 w-full min-w-0',
              feedType !== 'boobies' && 'invisible pointer-events-none'
            )}>
              <div className="flex items-center justify-center gap-1.5 w-full">
                <p className="text-sm text-muted-foreground">Duration</p>
                <span className="text-sm text-muted-foreground">·</span>
                <p className="text-sm text-muted-foreground">
                  Ended at <span className="font-medium text-foreground">{endsAtStr}</span>
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto w-full pb-1 scrollbar-none [touch-action:pan-x]">
                {DURATION_OPTIONS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={cn(
                      'flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      durationMinutes === mins
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border bg-background text-foreground'
                    )}
                  >
                    {mins}min
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-11" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 h-11" onClick={handleConfirm} disabled={saving}>
            {saving ? 'Saving…' : editEntry ? 'Update' : 'Confirm'}
          </Button>
        </div>

      </div>
    </BottomSheet>
  )
}
