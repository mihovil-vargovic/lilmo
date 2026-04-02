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
    tapCount.current += 1

    if (tapTimer.current) clearTimeout(tapTimer.current)
    tapTimer.current = setTimeout(() => { tapCount.current = 0 }, 2000)

    if (tapCount.current >= 5) {
      tapCount.current = 0
      const newPoops: Poop[] = Array.from({ length: 18 }, () => ({
        id: poopId.current++,
        x: 10 + Math.random() * 80,
        delay: Math.random() * 300,
        size: 18 + Math.random() * 10,
      }))
      setPoops((p) => [...p, ...newPoops])
      setTimeout(() => {
        setPoops((p) => p.filter((pp) => !newPoops.find((n) => n.id === pp.id)))
      }, 3200)
    }
  }

  return (
    <div className="bg-background px-4 py-2">
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
            onClick={() => {
              router.push(`/room/${code}/poop`)
              handleDiaperTap()
            }}
          >
            Diaper
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Poop confetti — fixed so nothing clips it */}
      {poops.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none fixed z-[9999]"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: '100px',
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}ms`,
            animation: `poopFly 2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            '--tx': `${-120 + Math.random() * 240}px`,
            '--ty': `${200 + Math.random() * 280}px`,
            '--pop': `${-(60 + Math.random() * 100)}px`,
            '--tr': `${-240 + Math.random() * 480}deg`,
          } as React.CSSProperties}
        >
          💩
        </span>
      ))}
    </div>
  )
}
