'use client'

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface FullScreenSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function FullScreenSheet({ open, onClose, title, children }: FullScreenSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent
        side="bottom"
        className="inset-x-0 bottom-0 h-[96svh] rounded-t-2xl rounded-b-none flex flex-col p-0 max-h-none overflow-hidden"
      >
        <div className="px-4 border-b border-border shrink-0">
          <SheetTitle className="text-lg font-semibold leading-[44px]">{title}</SheetTitle>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-3 pb-2">
          {children}
        </div>

        <div className="px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-border shrink-0">
          <Button variant="outline" className="w-full h-11" onClick={onClose}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
