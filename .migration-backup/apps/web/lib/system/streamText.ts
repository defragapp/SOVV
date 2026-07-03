/**
 * streamText.ts
 *
 * Word-by-word streaming for primary output text.
 * Client-side only — no server dependency.
 *
 * Usage (React hook):
 *   const displayed = useStreamText(output?.primary, output?.receivedAt)
 *   <p>{displayed}</p>
 */

"use client"

import { useState, useEffect, useRef } from "react"

const DEFAULT_DELAY_MS = 18 // ~55 words/sec — fast enough to feel live, slow enough to read

/**
 * Stream text word-by-word.
 * Resets when `key` changes (e.g. new output receivedAt timestamp).
 */
export function useStreamText(
  text: string | undefined,
  key: string | undefined,
  delayMs = DEFAULT_DELAY_MS
): string {
  const [displayed, setDisplayed] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const indexRef = useRef(0)

  useEffect(() => {
    // Reset on new output
    setDisplayed("")
    indexRef.current = 0

    if (!text) return

    const words = text.split(" ")

    function showNext() {
      if (indexRef.current >= words.length) return
      const word = words[indexRef.current]!
      setDisplayed(prev => (prev ? prev + " " + word : word))
      indexRef.current++
      timerRef.current = setTimeout(showNext, delayMs)
    }

    timerRef.current = setTimeout(showNext, delayMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return displayed
}

/**
 * Non-hook version: stream text into a callback.
 * Useful outside React components.
 */
export function streamText(
  text: string,
  onWord: (partial: string) => void,
  delayMs = DEFAULT_DELAY_MS
): () => void {
  const words = text.split(" ")
  let index = 0
  let accumulated = ""
  let timer: ReturnType<typeof setTimeout> | null = null

  function next() {
    if (index >= words.length) return
    accumulated = accumulated ? accumulated + " " + words[index] : words[index]!
    onWord(accumulated)
    index++
    timer = setTimeout(next, delayMs)
  }

  timer = setTimeout(next, delayMs)

  return () => {
    if (timer) clearTimeout(timer)
  }
}
