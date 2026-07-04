'use client'

import { useEffect, useRef, useState } from 'react'

export function AnimatedCounter({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setIsVisible(true), delay)
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.1 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className="flex flex-col items-center transition-all duration-500">
      <span
        className={`font-mono text-4xl md:text-5xl font-medium text-[#f4efe9] tracking-tight transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {value}
      </span>
      <span className="mt-2 text-xs md:text-sm text-[#76716b]">{label}</span>
    </div>
  )
}

export function AnimatedHeading({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    }, { threshold: 0.1 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <h2
      ref={ref}
      className={`font-serif text-[#f4efe9] transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </h2>
  )
}

export function StickyScrollSection({
  children,
  background = 'bg-[#08070a]',
}: {
  children: React.ReactNode
  background?: string
}) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const elementTop = rect.top
      const elementHeight = rect.height
      const windowHeight = window.innerHeight

      if (elementTop < windowHeight && elementTop + elementHeight > 0) {
        const progress = Math.max(0, Math.min(1, (windowHeight - elementTop) / (windowHeight + elementHeight)))
        setScrollProgress(progress)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      ref={ref}
      className={`relative w-full py-20 md:py-28 ${background} overflow-hidden`}
      style={{
        transform: `translateY(${scrollProgress * 20}px)`,
        opacity: 0.9 + scrollProgress * 0.1,
      }}
    >
      {children}
    </div>
  )
}

export function TextReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setIsVisible(true), delay)
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.1 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {children}
    </div>
  )
}