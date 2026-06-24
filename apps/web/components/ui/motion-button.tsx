"use client"
import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"

const SPRING_TRANSITION = { type: "spring", stiffness: 400, damping: 30, mass: 1 }

export const MotionButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof motion.button>>((props, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      transition={SPRING_TRANSITION}
      {...props}
    />
  )
})
MotionButton.displayName = "MotionButton"

// motion(Link) is required because Link is a custom component
const MotionNextLink = motion(Link)

export const MotionLink = React.forwardRef<HTMLAnchorElement, React.ComponentProps<typeof MotionNextLink>>((props, ref) => {
  return (
    <MotionNextLink
      ref={ref}
      whileTap={{ scale: 0.98 }}
      transition={SPRING_TRANSITION}
      {...props}
    />
  )
})
MotionLink.displayName = "MotionLink"
