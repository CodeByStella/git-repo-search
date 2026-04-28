"use client"

import { useEffect, useRef, useState } from "react"

type CountUpProps = {
  end: number
  /** Total animation length in milliseconds */
  durationMs?: number
  className?: string
}

export function CountUp({ end, durationMs = 1400, className }: CountUpProps) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) {
        return
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (reduced) {
        setDisplay(end)
        return
      }

      startRef.current = null
      setDisplay(0)

      function step(now: number) {
        if (cancelled) {
          return
        }
        if (startRef.current === null) {
          startRef.current = now
        }
        const elapsed = now - startRef.current
        const t = Math.min(1, elapsed / durationMs)
        const eased = 1 - (1 - t) ** 3
        setDisplay(Math.round(end * eased))
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step)
        } else {
          setDisplay(end)
        }
      }

      rafRef.current = requestAnimationFrame(step)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
    }
  }, [end, durationMs])

  return <span className={className}>{display.toLocaleString()}</span>
}
