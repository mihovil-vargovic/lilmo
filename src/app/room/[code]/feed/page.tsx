'use client'

import { useState } from 'react'
import FeedList from '@/components/feed/FeedList'
import FeedSummaryModal from '@/components/feed/FeedSummaryModal'
import StickyAddButton from '@/components/layout/StickyAddButton'
import { useFeedEntries } from '@/hooks/useFeedEntries'
import { useScrollHide } from '@/hooks/useScrollHide'
import { cn } from '@/lib/utils'

interface FeedPageProps {
  params: { code: string }
}

export default function FeedPage({ params }: FeedPageProps) {
  const { code } = params
  const [showPopover, setShowPopover] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useFeedEntries(code)
  const visible = useScrollHide()

  return (
    <>
      <FeedList
        entries={entries}
        loading={loading}
        addEntry={addEntry}
        updateEntry={updateEntry}
        deleteEntry={deleteEntry}
        showPopover={showPopover}
        onClosePopover={() => setShowPopover(false)}
      />

      {/* Add food button — centered */}
      <div
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <button
          onClick={() => setShowPopover(true)}
          className="h-12 w-36 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
        >
          Add food
        </button>
      </div>

      {/* Summary button — far right */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-40 transition-all duration-300',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <button
          onClick={() => setShowSummary(true)}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center justify-center"
          aria-label="Summary"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/baby-icon.png" alt="Summary" width={20} height={20} />
        </button>
      </div>

      <FeedSummaryModal
        open={showSummary}
        onClose={() => setShowSummary(false)}
        entries={entries}
      />
    </>
  )
}
