
import * as React from "react"
import { motion } from "framer-motion"
import { Link } from "wouter"

// MotionButton and MotionLink — no scale/bounce effects.
// Use opacity-based hover only. Consistent with platform motion rules.

export const MotionButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof motion.button>>((props, ref) => {
  return (
    <motion.button
      ref={ref}
      {...props}
    />
  )
})
MotionButton.displayName = "MotionButton"

const MotionNextLink = motion(Link)

export const MotionLink = React.forwardRef<HTMLAnchorElement, React.ComponentProps<typeof MotionNextLink>>((props, ref) => {
  return (
    <MotionNextLink
      ref={ref}
      {...props}
    />
  )
})
MotionLink.displayName = "MotionLink"
