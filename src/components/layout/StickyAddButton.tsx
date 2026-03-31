'use client'

import { Button } from '@/components/ui/button'
import { useScrollHide } from '@/hooks/useScrollHide'
import { cn } from '@/lib/utils'

interface StickyAddButtonProps {
  onClick: () => void
  label?: string
}

export default function StickyAddButton({
  onClick,
  label = 'Add Entry',
}: StickyAddButtonProps) {
  const visible = useScrollHide()

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Button
        onClick={onClick}
        className="rounded-full h-12 w-36 shadow-md"
      >
        {label}
      </Button>
    </div>
  )
}
