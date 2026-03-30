'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TabBarProps {
  code: string
}

export default function TabBar({ code }: TabBarProps) {
  const pathname = usePathname()
  const isFeed = pathname.includes('/feed')
  const isPoop = pathname.includes('/poop')

  return (
    <div className="flex border-b border-border bg-background">
      <Link
        href={`/room/${code}/feed`}
        className={cn(
          'flex-1 py-3 text-sm flex items-center justify-center gap-1.5 relative transition-colors',
          isFeed ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span>Feed</span>
        {isFeed && (
          <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-foreground" />
        )}
      </Link>
      <Link
        href={`/room/${code}/poop`}
        className={cn(
          'flex-1 py-3 text-sm flex items-center justify-center gap-1.5 relative transition-colors',
          isPoop ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span>Diaper</span>
        {isPoop && (
          <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-foreground" />
        )}
      </Link>
    </div>
  )
}
