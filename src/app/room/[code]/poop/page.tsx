'use client'

import { useState } from 'react'
import PoopList from '@/components/poop/PoopList'
import FeedSummaryModal from '@/components/feed/FeedSummaryModal'
import { usePoopEntries } from '@/hooks/usePoopEntries'
import { useFeedEntries } from '@/hooks/useFeedEntries'
import { useScrollHide } from '@/hooks/useScrollHide'
import { cn } from '@/lib/utils'

interface PoopPageProps {
  params: { code: string }
}

export default function PoopPage({ params }: PoopPageProps) {
  const { code } = params
  const [showPopover, setShowPopover] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const { entries, loading, addEntry, updateEntry, deleteEntry } = usePoopEntries(code)
  const { entries: feedEntries } = useFeedEntries(code)
  const { primary, secondary } = useScrollHide()

  return (
    <>
      <PoopList
        roomCode={code}
        showPopover={showPopover}
        onClosePopover={() => setShowPopover(false)}
      />

      {/* Log diaper button — centered */}
      <div
        className={cn(
          'fixed left-1/2 -translate-x-1/2 z-40 transition-all duration-300',
          primary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => setShowPopover(true)}
          className="h-12 w-36 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
        >
          + Diaper
        </button>
      </div>

      {/* Summary button — far right */}
      <div
        className={cn(
          'fixed right-6 z-40 transition-all duration-300',
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

      <FeedSummaryModal
        open={showSummary}
        onClose={() => setShowSummary(false)}
        entries={feedEntries}
        poopEntries={entries}
      />
    </>
  )
}
