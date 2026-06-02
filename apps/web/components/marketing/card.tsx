"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.18)" }}
      transition={{ duration: 0.2 }}
      className={`panel p-8 transition-all duration-300 ${
        glow ? "shadow-[0_0_40px_rgba(255,255,255,0.04)]" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}