'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomSheet from '@/components/shared/BottomSheet'
import { Button } from '@/components/ui/button'
import { roomExists } from '@/lib/roomCode'

interface SwitchRoomModalProps {
  open: boolean
  onClose: () => void
  currentCode: string
}

function CopyIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 9l4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="5" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 5V3.5A1.5 1.5 0 017.5 2h7A1.5 1.5 0 0116 3.5v10A1.5 1.5 0 0114.5 15H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2v10M5 6l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 13v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function SwitchRoomModal({
  open,
  onClose,
  currentCode,
}: SwitchRoomModalProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!open) {
      setJoinCode('')
      setJoinError('')
    }
  }, [open])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Join my Lilmo room',
        text: `Join my Lilmo baby tracking room with code: ${currentCode}`,
        url: `${window.location.origin}/room/${currentCode}/feed`,
      })
    } catch {
      // user dismissed or not supported
    }
  }

  const saveRoom = (code: string) => {
    localStorage.setItem('lilmo_room', code)
    document.cookie = `lilmo_room=${code}; path=/; max-age=31536000`
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = joinCode.trim()
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setJoinError('Please enter a valid 6-digit code.')
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
    saveRoom(trimmed)
    router.push(`/room/${trimmed}/feed`)
    onClose()
  }

  const codeReady = joinCode.length === 6

  return (
    <BottomSheet open={open} onClose={onClose} title="Switch room">
      <div className="space-y-6">
        {/* Current room */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Your current room code</p>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted">
            <span className="text-2xl font-mono font-semibold tracking-[0.3em]">
              {currentCode}
            </span>
            <div className="flex items-center">
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

        {/* Join another room */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Join another room</p>
          <div className="border border-border rounded-xl p-4">
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
                className="w-full px-3 py-2 text-center text-2xl font-mono tracking-[0.4em] border border-input focus:border-primary rounded-xl outline-none transition-colors bg-background"
              />
              {joinError && (
                <p className="text-sm text-destructive">{joinError}</p>
              )}
              <Button
                type="submit"
                variant={codeReady ? 'default' : 'outline'}
                disabled={joining || !codeReady}
                className="w-full h-11"
              >
                {joining ? 'Joining…' : 'Join room'}
              </Button>
            </form>
          </div>
        </div>

        {/* Cancel */}
        <Button
          variant="ghost"
          className="w-full h-11 text-muted-foreground"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </BottomSheet>
  )
}
