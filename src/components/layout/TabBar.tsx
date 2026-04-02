'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TabBarProps {
  code: string
}

interface Poop {
  id: number
  x: number
  delay: number
  size: number
}

export default function TabBar({ code }: TabBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const activeTab = pathname.includes('/poop') ? 'poop' : 'feed'
  const [poops, setPoops] = useState<Poop[]>([])
  const tapCount = useRef(0)
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const poopId = useRef(0)

  const handleDiaperTap = () => {
    router.push(`/room/${code}/poop`)
    tapCount.current += 1

    if (tapTimer.current) clearTimeout(tapTimer.current)
    tapTimer.current = setTimeout(() => { tapCount.current = 0 }, 1500)

    if (tapCount.current >= 5) {
      tapCount.current = 0
      const newPoops: Poop[] = Array.from({ length: 12 }, (_, i) => ({
        id: poopId.current++,
        x: 20 + Math.random() * 60,
        delay: Math.random() * 400,
        size: 18 + Math.random() * 16,
      }))
      setPoops((p) => [...p, ...newPoops])
      setTimeout(() => {
        setPoops((p) => p.filter((pp) => !newPoops.find((n) => n.id === pp.id)))
      }, 1800)
    }
  }

  return (
    <div className="bg-background px-4 py-2 relative">
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
            onClick={handleDiaperTap}
          >
            Diaper
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Poop confetti */}
      {poops.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute bottom-full"
          style={{
            left: `${p.x}%`,
            fontSize: p.size,
            animationDelay: `${p.delay}ms`,
            animation: `poopFly 1.4s ease-out forwards`,
          }}
        >
          💩
        </span>
      ))}

    </div>
  )
}
