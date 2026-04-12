'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import TabBar from '@/components/layout/TabBar'
import SwitchRoomModal from '@/components/shared/SwitchRoomModal'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { getOrCreateDeviceId, canDeviceJoin, registerDevice, isAppleDevice, isLocalhost } from '@/lib/roomCode'

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
  const pathname = usePathname()
  const router = useRouter()
  const isReleases = pathname.endsWith('/releases')
  const isSpouseId = pathname.endsWith('/spouse-id')
  const contentRef = useRef<HTMLDivElement>(null)

  const handleBack = () => {
    if (contentRef.current) {
      contentRef.current.style.animation = 'slideOutToRight 0.35s cubic-bezier(0.4,0,0.8,1) forwards'
      setTimeout(() => router.back(), 320)
    } else {
      router.back()
    }
  }

  useEffect(() => {
    async function checkAndSave() {
      if (isLocalhost() || sessionStorage.getItem('lilmo_bypass') === '1' || document.cookie.includes('lilmo_bypass=1')) {
        localStorage.setItem('lilmo_room', code)
        return
      }
      if (!isAppleDevice(navigator.userAgent)) {
        router.replace('/join?blocked=1')
        return
      }
      const deviceId = getOrCreateDeviceId()
      const { allowed, isNew } = await canDeviceJoin(code, deviceId)
      if (!allowed) {
        router.replace('/join?blocked=1')
        return
      }
      localStorage.setItem('lilmo_room', code)
      document.cookie = `lilmo_room=${code}; path=/; max-age=31536000`
      if (isNew) await registerDevice(code, deviceId)
    }
    checkAndSave()
  }, [code, router])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Offline banner + header — sticky */}
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
          {isReleases || isSpouseId ? (
            <div className="h-12 flex items-center px-4 md:px-8 border-b border-border">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          ) : (
            <div className="h-12 flex items-center justify-between px-4 md:px-8 border-b border-border">
              <span className="text-xl font-semibold tracking-wide">Lilmo</span>
              <div className="flex items-center gap-4">
                <Link
                  href={`/room/${code}/releases`}
                  className="hidden md:inline text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Releases
                </Link>
                <button
                  onClick={() => router.push(`/room/${code}/spouse-id`)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Spouse ID
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      {!isReleases && !isSpouseId && <TabBar code={code} />}

      {/* Content — children rendered exactly once */}
      <div className="flex-1 relative">
        <div
          ref={isSpouseId ? contentRef : undefined}
          style={isSpouseId ? { animation: 'slideInFromRight 0.35s cubic-bezier(0.32,0.72,0,1)' } : undefined}
        >
          {children}
        </div>
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
