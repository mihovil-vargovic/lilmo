'use client'

import { useEffect, useState } from 'react'
import TabBar from '@/components/layout/TabBar'
import SwitchRoomModal from '@/components/shared/SwitchRoomModal'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  return isOnline
}

interface RoomLayoutProps {
  children: React.ReactNode
  params: { code: string }
}

export default function RoomLayout({ children, params }: RoomLayoutProps) {
  const { code } = params
  const [switchOpen, setSwitchOpen] = useState(false)
  const isOnline = useOnlineStatus()

  // Auto-save room code when visiting the URL directly (e.g. shared link)
  useEffect(() => {
    localStorage.setItem('lilmo_room', code)
    document.cookie = `lilmo_room=${code}; path=/; max-age=31536000`
  }, [code])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Offline banner + header — sticky together */}
      <div className="sticky top-0 z-20">
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isOnline ? 'max-h-0' : 'max-h-10'
          )}
        >
          <div className="bg-orange-100 text-orange-700 text-xs text-center py-1.5 px-4">
            You appear to be offline
          </div>
        </div>
        <div className="bg-background">
          <div className="h-12 flex items-center justify-between px-4 md:px-8 border-b border-border">
            <span className="text-xl font-semibold tracking-wide">Lilmo</span>
            <button
              onClick={() => setSwitchOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Spouse ID
            </button>
          </div>
        </div>
      </div>
      {/* Tab bar scrolls with content */}
      <TabBar code={code} />

      {/* Content */}
      <div className="flex-1 relative">
        {children}
      </div>

      <SwitchRoomModal
        open={switchOpen}
        onClose={() => setSwitchOpen(false)}
        currentCode={code}
      />
      <Toaster position="top-center" toastOptions={{ style: { background: '#000', color: '#fff' } }} />
    </div>
  )
}
