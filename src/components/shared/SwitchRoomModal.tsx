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

  return (
    <BottomSheet open={open} onClose={onClose} title="Switch room">
      <div className="space-y-6">
        {/* Current room */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Your room code</p>
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted hover:bg-secondary transition-colors"
          >
            <span className="text-2xl font-mono font-semibold tracking-[0.3em]">
              {currentCode}
            </span>
            <span className="text-sm text-muted-foreground">
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium">or join another room</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Join room */}
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
            variant="outline"
            disabled={joining || joinCode.length !== 6}
            className="w-full h-11"
          >
            {joining ? 'Joining…' : 'Join room'}
          </Button>
        </form>

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
