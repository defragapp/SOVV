"use client";

import { motion } from "framer-motion";
import { UpgradeButton } from "@/components/UpgradeButton";

interface UpgradeGateProps {
  feature: string;
  description: string;
}

export default function UpgradeGate({ feature, description }: UpgradeGateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-4 border border-[#F6F5F3]/10 p-6"
    >
      <div>
        <span className="block font-mono text-[9px] uppercase tracking-widest text-white/30 mb-2">
          Pro feature
        </span>
        <p className="text-sm font-light text-[#F6F5F3]">{feature}</p>
        <p className="mt-1 text-sm font-light text-white/40 leading-6">{description}</p>
      </div>
      <div className="flex flex-col gap-3">
        <UpgradeButton label="Upgrade to Pro" />
        <p className="font-mono text-[9px] uppercase tracking-widest text-white/20">
          See the full pattern. Save what changes.
        </p>
      </div>
    </motion.div>
  );
}