'use client'

import TabBar from '@/components/layout/TabBar'
import RoomCode from '@/components/shared/RoomCode'

interface RoomLayoutProps {
  children: React.ReactNode
  params: { code: string }
}

export default function RoomLayout({ children, params }: RoomLayoutProps) {
  const { code } = params

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky header + tabs */}
      <div className="sticky top-0 z-20 bg-background">
        <div className="h-12 flex items-center justify-between px-4 border-b border-border">
          <span className="text-lg font-semibold tracking-tight">Lilmo</span>
          <RoomCode code={code} />
        </div>
        <TabBar code={code} />
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {children}
      </div>
    </div>
  )
}
