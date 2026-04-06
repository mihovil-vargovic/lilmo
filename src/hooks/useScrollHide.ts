'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollVisibility {
  primary: boolean   // Log food — leads on hide, follows on show
  secondary: boolean // Baby button — follows on hide, leads on show
}

export function useScrollHide(): ScrollVisibility {
  const [primary, setPrimary] = useState(true)
  const [secondary, setSecondary] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)
  const staggerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const diff = currentScrollY - lastScrollY.current

          if (staggerTimer.current) clearTimeout(staggerTimer.current)

          if (currentScrollY < 80) {
            // Near top — show both immediately
            setPrimary(true)
            setSecondary(true)
          } else if (diff > 0) {
            // Scrolling down — primary hides first, secondary follows
            setPrimary(false)
            staggerTimer.current = setTimeout(() => setSecondary(false), 40)
          } else {
            // Scrolling up — secondary shows first, primary follows
            setSecondary(true)
            staggerTimer.current = setTimeout(() => setPrimary(true), 40)
          }

          lastScrollY.current = currentScrollY
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (staggerTimer.current) clearTimeout(staggerTimer.current)
    }
  }, [])

  return { primary, secondary }
}
