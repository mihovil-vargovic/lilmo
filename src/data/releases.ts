export interface Release {
  date: string // ISO date string
  description: string
}

const releases: Release[] = [
  {
    date: '2026-04-09',
    description: 'Added All History view to the Summary sheet, showing a full day-by-day feed breakdown.',
  },
  {
    date: '2026-04-09',
    description: 'Smoother bottom sheet animations and toast notifications with a visual countdown timer.',
  },
  {
    date: '2026-04-08',
    description: 'Offline banner now animates smoothly and sticks together with the header.',
  },
  {
    date: '2026-04-08',
    description: 'Removed the X close button from all bottom sheets for a cleaner look.',
  },
  {
    date: '2026-04-07',
    description: 'Fixed an issue where log entries could be silently blocked when either partner logged recently.',
  },
  {
    date: '2026-04-06',
    description: 'FAB buttons now hide smoothly on scroll, with the summary button following slightly after the main CTA.',
  },
]

export default releases
