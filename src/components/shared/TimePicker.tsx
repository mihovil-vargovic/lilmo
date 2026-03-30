'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  value: Date
  onChange: (date: Date) => void
}

const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const hours = value.getHours()
  const minuteIndex = Math.round(value.getMinutes() / 5) % 12

  const setHours = (h: number) => {
    const d = new Date(value)
    d.setHours((h + 24) % 24)
    onChange(d)
  }

  const setMinuteIndex = (idx: number) => {
    const d = new Date(value)
    d.setMinutes(MINUTES[(idx + 12) % 12])
    onChange(d)
  }

  const chevronClass =
    'text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none'

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Hours */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setHours(hours + 1)}
          className={cn(chevronClass, 'p-1')}
          aria-label="Increase hours"
        >
          <ChevronUp className="w-7 h-7" />
        </button>
        <span className="text-5xl font-semibold tabular-nums w-[3.5rem] text-center leading-none">
          {pad(hours)}
        </span>
        <button
          type="button"
          onClick={() => setHours(hours - 1)}
          className={cn(chevronClass, 'p-1')}
          aria-label="Decrease hours"
        >
          <ChevronDown className="w-7 h-7" />
        </button>
      </div>

      <span className="text-4xl font-light text-muted-foreground select-none mb-0.5">
        :
      </span>

      {/* Minutes */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setMinuteIndex(minuteIndex + 1)}
          className={cn(chevronClass, 'p-1')}
          aria-label="Increase minutes"
        >
          <ChevronUp className="w-7 h-7" />
        </button>
        <span className="text-5xl font-semibold tabular-nums w-[3.5rem] text-center leading-none">
          {pad(MINUTES[minuteIndex])}
        </span>
        <button
          type="button"
          onClick={() => setMinuteIndex(minuteIndex - 1)}
          className={cn(chevronClass, 'p-1')}
          aria-label="Decrease minutes"
        >
          <ChevronDown className="w-7 h-7" />
        </button>
      </div>
    </div>
  )
}
