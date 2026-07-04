import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PRICING_CONFIG } from "@/data/marketing"
import Link from "next/link"

export function UpgradeBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-[#111111] to-[#0A0A0A] border border-white/[0.06] rounded-[10px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 ">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="text-[15px] text-[#f4efe9]">Sovereign.os Pro</h3>
          <Badge variant="pro">{PRICING_CONFIG.pro.price}/{PRICING_CONFIG.pro.period}</Badge>
        </div>
        <p className="text-sm text-[#a8a29a]">
          Unlock saved Results, your private Library, and deeper context across Defrag and Covenant.
        </p>
      </div>
      <form action="/api/checkout" method="POST" className="w-full sm:w-auto shrink-0">
        <input type="hidden" name="priceId" value={PRICING_CONFIG.pro.priceId} />
        <Button variant="premium" className="w-full sm:w-auto" type="submit">Upgrade to Pro</Button>
      </form>
    </div>
  )
}
