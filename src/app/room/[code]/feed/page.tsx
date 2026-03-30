'use client'

import { useState } from 'react'
import FeedList from '@/components/feed/FeedList'
import StickyAddButton from '@/components/layout/StickyAddButton'

interface FeedPageProps {
  params: { code: string }
}

export default function FeedPage({ params }: FeedPageProps) {
  const { code } = params
  const [showPopover, setShowPopover] = useState(false)

  return (
    <>
      <FeedList
        roomCode={code}
        showPopover={showPopover}
        onClosePopover={() => setShowPopover(false)}
      />
      <StickyAddButton onClick={() => setShowPopover(true)} label="Add Feed" />
    </>
  )
}
