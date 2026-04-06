export function roundToNearest5(date: Date): Date {
  const ms = 5 * 60 * 1000
  return new Date(Math.floor(date.getTime() / ms) * ms)
}

export function groupByDay<T extends { logged_at: string }>(
  entries: T[]
): { date: string; label: string; entries: T[] }[] {
  const groups: Record<string, T[]> = {}

  for (const entry of entries) {
    const date = new Date(entry.logged_at)
    const dateStr = date.toLocaleDateString('en-CA') // YYYY-MM-DD
    if (!groups[dateStr]) {
      groups[dateStr] = []
    }
    groups[dateStr].push(entry)
  }

  const today = new Date()
  const todayStr = today.toLocaleDateString('en-CA')
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toLocaleDateString('en-CA')

  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, entries]) => {
      let label: string
      if (date === todayStr) {
        label = 'Today'
      } else if (date === yesterdayStr) {
        label = 'Yesterday'
      } else {
        const d = new Date(date + 'T00:00:00')
        label = d.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      }
      return { date, label, entries }
    })
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Feed now'
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}
