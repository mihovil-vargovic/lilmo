'use client'

import { useRef, useState, useCallback } from 'react'

interface SwipeableRowProps {
  onEdit: () => void
  onDelete: () => void
  children: React.ReactNode
}

const ACTION_WIDTH = 80
const SWIPE_THRESHOLD = 50

export default function SwipeableRow({
  onEdit,
  onDelete,
  children,
}: SwipeableRowProps) {
  const [offset, setOffset] = useState(0)
  const [open, setOpen] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const isDragging = useRef(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const close = useCallback(() => {
    setOffset(0)
    setOpen(false)
  }, [])

  const openActions = useCallback(() => {
    setOffset(-ACTION_WIDTH * 2)
    setOpen(true)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isDragging.current = false

    longPressTimer.current = setTimeout(() => {
      openActions()
    }, 600)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    if (Math.abs(dy) > Math.abs(dx)) {
      // Vertical scroll — cancel long press, don't swipe
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
      return
    }

    isDragging.current = true
    if (longPressTimer.current) clearTimeout(longPressTimer.current)

    if (open) {
      setOffset(Math.min(0, -ACTION_WIDTH * 2 + dx))
    } else {
      if (dx < 0) {
        setOffset(Math.max(-ACTION_WIDTH * 2, dx))
      }
    }
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)

    if (!isDragging.current) return

    if (open) {
      if (offset > -ACTION_WIDTH) {
        close()
      } else {
        openActions()
      }
    } else {
      if (offset < -SWIPE_THRESHOLD) {
        openActions()
      } else {
        close()
      }
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons */}
      <div
        className="absolute inset-y-0 right-0 flex"
        style={{ width: ACTION_WIDTH * 2 }}
      >
        <button
          className="flex-1 bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center"
          onClick={() => {
            close()
            onEdit()
          }}
        >
          Edit
        </button>
        <button
          className="flex-1 bg-destructive text-destructive-foreground text-sm font-medium flex items-center justify-center"
          onClick={() => {
            close()
            onDelete()
          }}
        >
          Delete
        </button>
      </div>

      {/* Content */}
      <div
        className="relative bg-background transition-transform"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.25s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
