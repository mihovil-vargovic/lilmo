'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetPortal,
  SheetOverlay,
} from '@/components/ui/sheet'

interface DeleteConfirmSheetProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteConfirmSheet({ open, onCancel, onConfirm }: DeleteConfirmSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <SheetPortal>
        <SheetOverlay />
        <SheetContent
          side="bottom"
          className="px-4 pt-6 pb-4 [&>button]:hidden md:inset-0 md:m-auto md:w-[520px] md:h-fit md:rounded-2xl md:data-[state=open]:slide-in-from-bottom-[50px] md:data-[state=closed]:slide-out-to-bottom-[50px]"
        >
          <div className="-mx-4 -mt-6 mb-5 overflow-hidden rounded-t-2xl">
            <Image src="/delete-illustration.png" alt="" width={600} height={300} className="w-full h-auto" />
          </div>
          <div className="flex flex-col gap-1 mb-5">
            <h2 className="text-base font-semibold">Delete entry</h2>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={onConfirm}
              className="w-full h-11 rounded-xl bg-red-500 text-white text-sm font-semibold transition-colors hover:bg-red-600"
            >
              Delete
            </button>
            <Button variant="outline" className="w-full h-11" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  )
}
