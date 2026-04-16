'use client'

import { useState } from 'react'
import PoopList from '@/components/poop/PoopList'
import FeedSummaryModal from '@/components/feed/FeedSummaryModal'
import { useRoomData } from '@/lib/RoomDataContext'
import { useScrollHide } from '@/hooks/useScrollHide'
import { cn } from '@/lib/utils'

interface PoopPageProps {
  params: { code: string }
}

export default function PoopPage({ params: _ }: PoopPageProps) {
  const [showPopover, setShowPopover] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const { poop: { entries, loading }, feed: { entries: feedEntries } } = useRoomData()
  const { primary, secondary } = useScrollHide()

  return (
    <>
      <PoopList
        showPopover={showPopover}
        onClosePopover={() => setShowPopover(false)}
      />

      {/* Mobile: CTA centered */}
      <div
        className={cn(
          'fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-300 md:hidden',
          primary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => setShowPopover(true)}
          className="h-12 w-[104px] rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
        >
          + Diaper
        </button>
      </div>

      {/* Mobile: summary far right */}
      <div
        className={cn(
          'fixed right-6 z-40 transition-all duration-300 md:hidden',
          secondary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => setShowSummary(true)}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-center"
          aria-label="Summary"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/baby-icon.png" alt="Summary" width={20} height={20} style={{ marginTop: '-1px' }} />
        </button>
      </div>

      {/* Desktop: both buttons centered together */}
      <div
        className={cn(
          'hidden md:flex fixed left-1/2 -translate-x-1/2 z-40 items-center gap-3 transition-all duration-300',
          primary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => setShowPopover(true)}
          className="h-12 w-[104px] rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
        >
          + Diaper
        </button>
        <button
          onClick={() => setShowSummary(true)}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-center"
          aria-label="Summary"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/baby-icon.png" alt="Summary" width={20} height={20} style={{ marginTop: '-1px' }} />
        </button>
      </div>

      <FeedSummaryModal
        open={showSummary}
        onClose={() => setShowSummary(false)}
        entries={feedEntries}
        poopEntries={entries}
      />
    </>
  )
}
