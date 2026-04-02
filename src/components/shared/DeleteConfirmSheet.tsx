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
          className="px-4 pt-4 pb-8 max-w-md mx-auto rounded-t-2xl [&>button]:hidden"
        >
          <div className="flex flex-col gap-2">
            <div className="rounded-xl overflow-hidden border border-border">
              <div className="px-4 py-3 text-center border-b border-border">
                <p className="text-sm font-semibold">Delete entry</p>
                <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone</p>
              </div>
              <button
                onClick={onConfirm}
                className="w-full px-4 py-3.5 text-sm font-semibold text-red-500 bg-background hover:bg-muted transition-colors"
              >
                Delete
              </button>
            </div>
            <Button variant="outline" className="w-full h-11" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  )
}
