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
  headerAction?: React.ReactNode
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  headerAction,
}: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent
        side="bottom"
        className="px-0 pb-0 pt-[10px] max-h-[90vh] overflow-y-auto [touch-action:pan-y] md:inset-0 md:m-auto md:w-[520px] md:h-fit md:max-h-[85vh] md:rounded-2xl md:data-[state=open]:slide-in-from-bottom-[50px] md:data-[state=closed]:slide-out-to-bottom-[50px]"
      >
        <SheetHeader className="px-4 pb-2 border-b border-border text-left flex-row items-center justify-between pt-0">
          <SheetTitle className="text-lg font-semibold leading-[44px]">{title}</SheetTitle>
          {headerAction && <div className="flex items-center">{headerAction}</div>}
        </SheetHeader>
        <div className="px-4 pt-3 pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
