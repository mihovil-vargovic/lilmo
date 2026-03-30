'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { PoopEntry } from '@/types'

interface PoopBarChartProps {
  entries: PoopEntry[]
}

export default function PoopBarChart({ entries }: PoopBarChartProps) {
  // Build last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      date: d.toLocaleDateString('en-CA'),
      label: i === 6 ? 'Today' : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      poop: 0,
      pee: 0,
      poop_and_pee: 0,
    }
  })

  for (const entry of entries) {
    const date = new Date(entry.logged_at).toLocaleDateString('en-CA')
    const day = days.find((d) => d.date === date)
    if (day) {
      day[entry.type]++
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Diaper events (last 7 days)
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={days} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="poop" name="Poop" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pee" name="Pee" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="poop_and_pee" name="Both" fill="hsl(var(--secondary-foreground))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
