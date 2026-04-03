'use client'

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
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent
        side="bottom"
        className="px-0 pb-0 pt-[10px] max-h-[90vh] overflow-y-auto [touch-action:pan-y]"
      >
        <SheetHeader className="px-4 pb-2 border-b border-border text-left flex-row items-center justify-between pr-14 pt-0">
          <SheetTitle className="text-lg font-semibold leading-[44px]">{title}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pt-3 pb-safe">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
