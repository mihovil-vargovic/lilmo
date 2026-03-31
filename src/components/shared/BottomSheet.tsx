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
        className="px-0 pb-0 max-h-[90vh] overflow-y-auto overflow-x-hidden"
      >
        <SheetHeader className="px-4 pb-4 border-b border-border text-left flex-row items-center justify-between pr-14">
          <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
        </SheetHeader>
        <div className="p-4 pb-safe">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
