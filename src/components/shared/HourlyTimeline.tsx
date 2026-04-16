'use client'

interface HourlyTimelineProps {
  timestamps: string[] // ISO date strings
}

export default function HourlyTimeline({ timestamps }: HourlyTimelineProps) {
  const now = Date.now()
  const msPerHour = 60 * 60 * 1000

  // Build a set of which hour-slots (0–23, where 23 = current hour) have entries
  const filled = new Set<number>()
  for (const ts of timestamps) {
    const diff = now - new Date(ts).getTime()
    if (diff >= 0 && diff < 24 * msPerHour) {
      const slot = 23 - Math.floor(diff / msPerHour)
      filled.add(slot)
    }
  }

  return (
    <div className="flex gap-[3px] px-4 md:px-8 py-3">
      {Array.from({ length: 24 }, (_, i) => (
        <div
          key={i}
          className={`flex-1 h-[5px] rounded-[2px] ${filled.has(i) ? 'bg-foreground' : 'bg-border'}`}
        />
      ))}
    </div>
  )
}
