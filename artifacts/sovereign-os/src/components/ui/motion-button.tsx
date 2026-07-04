
import * as React from "react"
import { motion } from "framer-motion"

// MotionButton — opacity-based hover only. No scale/bounce.
// Consistent with platform motion rules.

export const MotionButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof motion.button>
>((props, ref) => (
  <motion.button ref={ref} {...props} />
))
MotionButton.displayName = "MotionButton"
