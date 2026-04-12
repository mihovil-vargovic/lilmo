'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomSheet from '@/components/shared/BottomSheet'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetPortal, SheetOverlay } from '@/components/ui/sheet'
import { ChevronRight } from 'lucide-react'
import { roomExists, getOrCreateDeviceId, canDeviceJoin, registerDevice, resetRoomDevices, parseDeviceLabel, isAppleDevice, isLocalhost } from '@/lib/roomCode'
import { supabase } from '@/lib/supabase'

interface PageProps {
  params: { code: string }
}

function CopyIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
        <path d="M3 9l4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="5" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 5V3.5A1.5 1.5 0 017.5 2h7A1.5 1.5 0 0116 3.5v10A1.5 1.5 0 0114.5 15H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <path d="M9 2v10M5 6l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 13v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function SpouseIdPage({ params }: PageProps) {
  const { code } = params
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [devices, setDevices] = useState<{ device_id: string; user_agent: string | null; joined_at: string }[]>([])

  // Join sheet state
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)

  // Reset sheet state
  const [resetOpen, setResetOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  useEffect(() => {
    supabase
      .from('room_devices')
      .select('device_id, user_agent, joined_at')
      .eq('room_code', code)
      .then(({ data }) => setDevices(data || []))
  }, [code])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Join me on Lilmo',
        text: `Join my Lilmo baby tracking with Spouse ID: ${code}`,
        url: `${window.location.origin}/room/${code}/feed`,
      })
    } catch {
      // user dismissed or not supported
    }
  }

  const saveRoom = (c: string) => {
    localStorage.setItem('lilmo_room', c)
    document.cookie = `lilmo_room=${c}; path=/; max-age=31536000`
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = joinCode.trim()
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setJoinError('Please enter a valid 6-digit code.')
      return
    }
    const isBypassed = sessionStorage.getItem('lilmo_bypass') === '1' || document.cookie.includes('lilmo_bypass=1')
    if (!isBypassed && !isLocalhost() && !isAppleDevice(navigator.userAgent)) {
      setJoinError('Lilmo is only available on Apple devices.')
      return
    }
    setJoining(true)
    setJoinError('')
    const exists = await roomExists(trimmed)
    if (!exists) {
      setJoinError('Room not found. Check the code and try again.')
      setJoining(false)
      return
    }
    if (!isBypassed && !isLocalhost()) {
      const deviceId = getOrCreateDeviceId()
      const { allowed, isNew } = await canDeviceJoin(trimmed, deviceId)
      if (!allowed) {
        setJoinError('This Spouse ID is already in use on 4 devices.')
        setJoining(false)
        return
      }
      saveRoom(trimmed)
      if (isNew) await registerDevice(trimmed, deviceId)
    } else {
      saveRoom(trimmed)
    }
    router.push(`/room/${trimmed}/feed`)
    setJoinOpen(false)
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      await resetRoomDevices(code)
      setResetDone(true)
      setDevices([])
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="pb-16 pb-safe">
      {/* Large title */}
      <h1 className="text-[34px] font-bold tracking-tight px-4 md:px-8 pt-1 pb-2">Spouse ID</h1>

      {/* Spouse ID code card */}
      <div className="pt-7 pb-0">
        <p className="text-[13px] text-foreground/50 pl-4 md:pl-8 mb-1">Your Spouse ID</p>
        <div className="flex items-center justify-between px-5 py-4 mx-4 md:mx-8 rounded-2xl border border-border">
          <span className="text-3xl font-mono font-semibold tracking-[0.35em]">{code}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Copy code"
            >
              <CopyIcon checked={copied} />
            </button>
            <button
              onClick={handleShare}
              className="w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Share"
            >
              <ShareIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Registered devices */}
      <div className="pt-7 pb-0">
        <p className="text-[13px] text-foreground/50 pl-4 md:pl-8 mb-1">
          Registered devices ({devices.length}/4)
        </p>
        {devices.length === 0 ? (
          <div className="px-5 py-4 mx-4 md:mx-8 rounded-2xl bg-muted">
            <p className="text-sm text-muted-foreground">No registered devices.</p>
          </div>
        ) : (
          <div className="mx-4 md:mx-8 rounded-2xl bg-muted overflow-hidden">
            {devices.map((d, i) => {
              const isThis = d.device_id === getOrCreateDeviceId()
              const label = d.user_agent ? parseDeviceLabel(d.user_agent) : 'Unknown device'
              const date = new Date(d.joined_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              return (
                <div key={d.device_id}>
                  {i > 0 && <div className="h-px bg-border mx-5" />}
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium">{label}{isThis && <span className="ml-2 text-xs text-muted-foreground font-normal">This device</span>}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{date}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Actions list */}
      <div className="pt-7">
        <div className="mx-4 md:mx-8 rounded-2xl border border-border overflow-hidden">
          {/* Join your spouse */}
          <button
            onClick={() => { setJoinCode(''); setJoinError(''); setJoinOpen(true) }}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/80 transition-colors"
          >
            <span className="text-base font-medium">Join your spouse</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="h-px bg-border mx-5" />
          {/* Reset Spouse ID */}
          <button
            onClick={() => { setResetDone(false); setResetOpen(true) }}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/80 transition-colors"
          >
            <span className="text-base font-medium text-destructive">Reset Spouse ID access</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Join Bottom Sheet */}
      <BottomSheet open={joinOpen} onClose={() => setJoinOpen(false)} title="Join your spouse">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">Enter the 6-digit Spouse ID from your partner.</p>
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.replace(/\D/g, ''))
                setJoinError('')
              }}
              placeholder="123456"
              className="w-full px-3 py-3 text-center text-2xl font-mono tracking-[0.4em] border border-input focus:border-primary rounded-xl outline-none transition-colors bg-background"
            />
            {joinError && (
              <p className="text-sm text-destructive">{joinError}</p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-11" onClick={() => setJoinOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={joining || joinCode.length !== 6}
                className="flex-1 h-11"
              >
                {joining ? 'Joining…' : 'Join'}
              </Button>
            </div>
          </form>
        </div>
      </BottomSheet>

      {/* Reset Sheet */}
      <Sheet open={resetOpen} onOpenChange={(o) => { if (!o) setResetOpen(false) }}>
        <SheetPortal>
          <SheetOverlay />
          <SheetContent
            side="bottom"
            className="px-4 pt-6 pb-4 [&>button]:hidden md:inset-0 md:m-auto md:w-[520px] md:h-fit md:rounded-2xl md:data-[state=open]:slide-in-from-bottom-[50px] md:data-[state=closed]:slide-out-to-bottom-[50px]"
          >
            {resetDone ? (
              <>
                <div className="flex flex-col gap-1 mb-5">
                  <h2 className="text-base font-semibold">Access reset</h2>
                  <p className="text-sm text-muted-foreground">All devices removed. Everyone will need to re-join.</p>
                </div>
                <Button className="w-full h-11" onClick={() => setResetOpen(false)}>Done</Button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1 mb-5">
                  <h2 className="text-base font-semibold">Reset Spouse ID access</h2>
                  <p className="text-sm text-muted-foreground">This removes all registered devices. If your partner got a new phone and can't join, reset access to allow re-registration.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="w-full h-11 rounded-xl bg-red-500 text-white text-sm font-semibold transition-colors hover:bg-red-600 disabled:opacity-50"
                  >
                    {resetting ? 'Resetting…' : 'Reset access'}
                  </button>
                  <Button variant="outline" className="w-full h-11" onClick={() => setResetOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </SheetPortal>
      </Sheet>
    </div>
  )
}
