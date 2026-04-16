'use client'

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  headerAction?: React.ReactNode
  liftWithKeyboard?: boolean
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  headerAction,
  liftWithKeyboard,
}: BottomSheetProps) {
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  useEffect(() => {
    if (!liftWithKeyboard || !open) {
      setKeyboardOffset(0)
      return
    }
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop
      setKeyboardOffset(Math.max(0, offset))
    }

    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()

    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      setKeyboardOffset(0)
    }
  }, [liftWithKeyboard, open])

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent
        side="bottom"
        className="px-0 pb-0 pt-2 max-h-[90vh] overflow-y-auto [touch-action:pan-y] md:inset-0 md:m-auto md:w-[520px] md:h-fit md:max-h-[85vh] md:rounded-2xl md:data-[state=open]:slide-in-from-bottom-[50px] md:data-[state=closed]:slide-out-to-bottom-[50px]"
        style={keyboardOffset > 0 ? { bottom: keyboardOffset, transition: 'bottom 150ms ease-out' } : undefined}
      >
        <SheetHeader className="px-4 h-[52px] border-b border-border text-left flex-row items-center justify-between pt-0 pb-0 space-y-0">
          <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
          {headerAction && <div className="flex items-center">{headerAction}</div>}
        </SheetHeader>
        <div className="px-4 pt-3 pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
