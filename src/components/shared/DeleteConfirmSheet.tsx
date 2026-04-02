'use client'

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
          className="px-4 pt-6 pb-8 [&>button]:hidden"
        >
          <div className="flex flex-col gap-1 mb-5">
            <h2 className="text-base font-semibold">Delete entry</h2>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={onConfirm}
              className="w-full h-11 rounded-xl bg-red-50 text-red-500 text-sm font-semibold transition-colors hover:bg-red-100"
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
