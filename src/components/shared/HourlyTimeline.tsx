'use client'

interface HourlyTimelineProps {
  timestamps: string[]
}

function hourLabel(hour: number): string {
  return String(hour).padStart(2, '0')
}

export default function HourlyTimeline({ timestamps }: HourlyTimelineProps) {
  const now = new Date()
  const currentHour = now.getHours()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  // Which hours today have at least one entry
  const filled = new Set<number>()
  for (const ts of timestamps) {
    const d = new Date(ts)
    if (d.getTime() >= todayStart) {
      filled.add(d.getHours())
    }
  }

  // Always 24 slots: hours 0–23
  const slots = Array.from({ length: 24 }, (_, i) => i)

  // Only label slots that have entries
  const labelSlots = filled

  return (
    <div className="px-4 md:px-8 pt-3 pb-1">
      {/* Bars */}
      <div className="flex items-end gap-[3px] h-10">
        {slots.map((h) => {
          const isFuture = h > currentHour
          const isFilled = filled.has(h)
          const isEmpty = !isFuture && !isFilled
          return (
            <div
              key={h}
              className={`flex-1 h-full rounded-md ${
                isFuture ? 'bg-border/40' : isFilled ? 'bg-foreground' : ''
              }`}
              style={isEmpty ? {
                backgroundColor: '#f0f0f0',
                backgroundImage: 'repeating-linear-gradient(-45deg, #aaaaaa 0px, #aaaaaa 1px, #f0f0f0 1px, #f0f0f0 4px)',
              } : undefined}
            />
          )
        })}
      </div>
      {/* Hour labels */}
      <div className="flex mt-1">
        {slots.map((h) => (
          <div key={h} className="flex-1 flex justify-center">
            {labelSlots.has(h) && (
              <span className="text-[9px] text-muted-foreground whitespace-nowrap">{hourLabel(h)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
