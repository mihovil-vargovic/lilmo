export interface Release {
  date: string // ISO date string
  description: string
}

const releases: Release[] = [
  {
    date: '2026-04-12',
    description: 'Bottom sheets now open and close with a proper iOS spring animation — snappy close, soft spring open.',
  },
  {
    date: '2026-04-12',
    description: 'Duration picker now goes up to 45 minutes (added 35, 40, 45 options). "Today" heading removed from Food and Diaper tabs.',
  },
  {
    date: '2026-04-12',
    description: 'Spouse ID page polish: slide-in animation, outline cards, normal-case labels, and instant back navigation with no reload.',
  },
  {
    date: '2026-04-12',
    description: 'Diaper tab Summary now shows the same Daily progress card as the Food tab — feedings, bottle/boobies breakdown, and poop count all in one place.',
  },
  {
    date: '2026-04-11',
    description: 'Spouse ID is now a full page with a cleaner layout — your code, registered devices, join your spouse, and reset access all in one place.',
  },
  {
    date: '2026-04-11',
    description: 'Summary now shows a Daily progress card with a narrative of today\'s feedings and diaper count. Yesterday moved to All history.',
  },
  {
    date: '2026-04-11',
    description: 'Summary button and diaper stats are now available on the Diaper tab, matching the Food tab.',
  },
  {
    date: '2026-04-11',
    description: 'Delete confirmation now loads instantly — illustration compressed from 340KB to 83KB.',
  },
  {
    date: '2026-04-11',
    description: 'Spouse ID is now limited to 4 devices, Apple devices only. Registered devices visible in the Spouse ID modal with device type and join date.',
  },
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
