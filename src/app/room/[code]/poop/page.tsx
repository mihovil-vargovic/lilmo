'use client'

import { useState } from 'react'
import PoopList from '@/components/poop/PoopList'
import StickyAddButton from '@/components/layout/StickyAddButton'

interface PoopPageProps {
  params: { code: string }
}

export default function PoopPage({ params }: PoopPageProps) {
  const { code } = params
  const [showPopover, setShowPopover] = useState(false)

  return (
    <>
      <PoopList
        roomCode={code}
        showPopover={showPopover}
        onClosePopover={() => setShowPopover(false)}
      />
      <StickyAddButton onClick={() => setShowPopover(true)} label="Log diaper" />
    </>
  )
}
