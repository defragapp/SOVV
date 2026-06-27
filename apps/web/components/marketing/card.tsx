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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`card p-8 group relative ${
        glow ? "glow-sm" : ""
      } ${className}`}
    >
      <div className="absolute inset-0 z-0 rounded-[20px] bg-gradient-to-br from-[#e0743a]/[0.04] to-transparent opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100" />
      <div className="relative z-10">{children as any}</div>
    </motion.div>
  );
}