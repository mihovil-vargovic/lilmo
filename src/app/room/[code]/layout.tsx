'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import TabBar from '@/components/layout/TabBar'
import RoomCode from '@/components/shared/RoomCode'

interface RoomLayoutProps {
  children: React.ReactNode
  params: { code: string }
}

export default function RoomLayout({ children, params }: RoomLayoutProps) {
  const { code } = params

  // Auto-save room code when visiting the URL directly (e.g. shared link)
  useEffect(() => {
    localStorage.setItem('lilmo_room', code)
    document.cookie = `lilmo_room=${code}; path=/; max-age=31536000`
  }, [code])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky header + tabs */}
      <div className="sticky top-0 z-20 bg-background">
        <div className="h-12 flex items-center justify-between px-4 border-b border-border">
          <span className="text-lg font-semibold tracking-tight">Lilmo</span>
          <div className="flex items-center gap-2">
            <RoomCode code={code} />
            <Link
              href="/join"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Switch
            </Link>
          </div>
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
