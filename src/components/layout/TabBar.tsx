'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TabBarProps {
  code: string
}

export default function TabBar({ code }: TabBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const activeTab = pathname.includes('/poop') ? 'poop' : 'feed'

  return (
    <div className="border-b border-border bg-background px-2 pt-1">
      <Tabs value={activeTab}>
        <TabsList className="w-full">
          <TabsTrigger
            value="feed"
            className="flex-1"
            onClick={() => router.push(`/room/${code}/feed`)}
          >
            Food
          </TabsTrigger>
          <TabsTrigger
            value="poop"
            className="flex-1"
            onClick={() => router.push(`/room/${code}/poop`)}
          >
            Diaper
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
