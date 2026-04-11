'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { generateRoomCode, createRoom, roomExists, getOrCreateDeviceId, canDeviceJoin, registerDevice, isAppleDevice, isLocalhost } from '@/lib/roomCode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function JoinPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [titleTaps, setTitleTaps] = useState(0)
  const [bypassInput, setBypassInput] = useState('')
  const [bypassed, setBypassed] = useState(false)

  const isBlocked = searchParams.get('blocked') === '1'

  const handleTitleTap = () => {
    setTitleTaps(prev => prev + 1)
  }

  const handleBypassSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const hash = await hashString(bypassInput.trim())
    if (hash === process.env.NEXT_PUBLIC_BYPASS_HASH) {
      setBypassed(true)
    }
    setTitleTaps(0)
    setBypassInput('')
  }

  const saveRoom = (code: string) => {
    localStorage.setItem('lilmo_room', code)
    document.cookie = `lilmo_room=${code}; path=/; max-age=31536000`
  }

  const handleCreate = async () => {
    if (!bypassed && !isLocalhost() && !isAppleDevice(navigator.userAgent)) {
      return
    }
    setCreating(true)
    try {
      const code = generateRoomCode()
      await createRoom(code)
      saveRoom(code)
      if (!bypassed && !isLocalhost()) {
        const deviceId = getOrCreateDeviceId()
        await registerDevice(code, deviceId)
      }
      router.push(`/room/${code}/feed`)
    } catch (e) {
      console.error(e)
      setCreating(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = joinCode.trim()
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setJoinError('Please enter a valid 6-digit code.')
      return
    }
    if (!bypassed && !isLocalhost() && !isAppleDevice(navigator.userAgent)) {
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
    if (!bypassed && !isLocalhost()) {
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
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Header — tap 7× to reveal bypass input */}
        <div className="text-center">
          <h1
            className="text-4xl font-semibold tracking-tight cursor-default"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            onPointerDown={(e) => { e.preventDefault(); handleTitleTap() }}
          >
            Lilmo
          </h1>
          {bypassed && (
            <p className="text-xs text-muted-foreground mt-1">✓</p>
          )}
        </div>

        {/* Hidden bypass input — appears after 7 taps */}
        {titleTaps >= 7 && !bypassed && (
          <form onSubmit={handleBypassSubmit}>
            <input
              type="password"
              autoFocus
              value={bypassInput}
              onChange={(e) => setBypassInput(e.target.value)}
              className="w-full px-3 py-2 text-center border border-input rounded-md outline-none bg-background text-sm"
              placeholder="···"
            />
          </form>
        )}

        {/* Blocked banner */}
        {isBlocked && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            This Spouse ID is already in use on 4 devices. Ask your partner to reset access from their Spouse ID settings.
          </div>
        )}

        {/* Create room */}
        <Card className="border border-border rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">New room</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Create a room and share the code with your partner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="w-full"
            >
              {creating ? 'Creating…' : 'Create room'}
            </Button>
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Join room */}
        <Card className="border border-border rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Join a room</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Enter the 6-digit code from your partner.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                className="w-full px-3 py-2 text-center text-2xl font-mono tracking-[0.4em] border border-input focus:border-primary rounded-md outline-none transition-colors bg-background"
              />
              {joinError && (
                <p className="text-sm text-destructive">{joinError}</p>
              )}
              <Button
                type="submit"
                variant="outline"
                disabled={joining || joinCode.length !== 6}
                className="w-full"
              >
                {joining ? 'Joining…' : 'Join room'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinPageContent />
    </Suspense>
  )
}
