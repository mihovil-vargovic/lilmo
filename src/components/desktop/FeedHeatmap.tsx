'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { FeedEntry } from '@/types'

interface FeedHeatmapProps {
  entries: FeedEntry[]
}

export default function FeedHeatmap({ entries }: FeedHeatmapProps) {
  const hourCounts = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: i.toString().padStart(2, '0'),
    count: 0,
  }))

  for (const entry of entries) {
    const hour = new Date(entry.logged_at).getHours()
    hourCounts[hour].count++
  }

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Feed pattern (time of day)
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={hourCounts} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            interval={3}
          />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
          <Tooltip
            formatter={(value) => [value, 'Feeds']}
            labelFormatter={(label) => `${label}:00`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
          />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
