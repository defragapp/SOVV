# Product Marketing, Checkout, and iOS Standard

## Marketing Tone Rules

### The Voice Standard

The public voice must sound like it was written for someone in a real moment — not for a SaaS homepage.

**Tone benchmark:**
```
Healing isn't optional.
Holding the pain is.
```

This is the standard. Sharp truth. Polarity. Human. Emotionally direct. Memorable. Premium.

### What the copy must speak to

- The text someone keeps rereading
- The message they should not send yet
- The family role they keep stepping back into
- Grief that changes how everything lands
- The boundary they know they need but cannot say cleanly
- The relationship pattern they can feel before they can explain
- The younger part of them that learned to protect, perform, please, fight, freeze, disappear, or carry the room
- The moment where another person's reality feels completely different from theirs

### Forbidden copy patterns

Never use:
- "AI-powered clarity"
- "unlock insights"
- "transform your journey"
- "personalized guidance"
- "empower relationships"
- "make your patterns useful"
- "get insights"
- "understand yourself better"
- "your private workspace" (as the main description)
- Vague platform language that explains features instead of human stakes

### Approved sharp lines (use/adapt)

```
Healing isn't optional. Holding the pain is.
The moment happened once. The pattern keeps happening until you can see it.
The message is not just the message.
The role is older than the argument.
The boundary is not the problem.
Grief changes how everything lands.
Some patterns need both sides.
Your next response can change the pattern.
Save what you learn before you lose it.
The other side may not be lying. They may be living from another map.
You do not need a verdict. You need a way through.
What you learned to carry does not have to lead.
The conversation ended. Your body did not.
Some messages do not need a reply yet. They need context.
You are not overreacting. You may be repeating.
The pattern is louder than the moment.
Before you send the message, understand the pattern.
Before you explain yourself again, return to yourself first.
Some family roles survive long after childhood.
The wound is real. So is the choice after it.
Alignment is not perfection. It is the moment you stop betraying what you already know.
```

---

## Landing Page Structure

```
1. Full-screen hero
   SOVEREIGN.OS
   Healing isn't optional.
   Holding the pain is.
   CTAs: Enter Sovereign.os / Start Baseline Design

2. The real moments
   Message, family role, boundary, grief, relationship dynamic, parenting, team conflict.

3. What Sovereign.os does
   Structure for active moments without diagnosis, scoring, or verdicts.

4. Baseline Design
   The source map for pressure, repair, connection, timing, and alignment.

5. Defrag
   Work through the pattern underneath the moment.

6. What you learned to carry
   Old survival roles running new moments.

7. Covenant
   Faith, reflection, responsibility, repair, and grounded discernment.

8. When both sides matter
   Invite privately. Compare only with consent.

9. Library
   Save what you learn before the moment disappears.

10. Pro
    For work that needs continuity.

11. Final CTA
    Healing isn't optional.
    Holding the pain is.
    Enter Sovereign.os.
```

---

## Visual Asset Standards

### Required assets

| Asset | Standard |
|---|---|
| `brand-mark.svg` | Geometric precision, monochrome, structural grid, white center point, fragment chars as texture |
| `social-card.svg` | "Healing isn't optional. Holding the pain is." headline, monochrome, structural grid |
| `favicon` | Brand mark at 32x32, monochrome |
| `apple-touch-icon` | Brand mark at 180x180, dark background |
| Open Graph image | social-card.svg content |

### Asset style rules

- Monochrome: black/white foundation, layered grayscale
- Sharp geometry: lines, panels, contours
- No clip art, no wellness illustrations, no celestial symbols
- No AI sparkle icons, no generic startup stock art
- Lightweight SVG/CSS preferred
- Fragment chars (`01·—/\|_░▒▓`) as subtle texture only

---

## iOS / Mobile Requirements

### Required implementations

| Requirement | Implementation |
|---|---|
| iOS zoom prevention | `font-size: 16px` on all inputs |
| Safe area padding | `env(safe-area-inset-top/bottom)` via `.safe-top` / `.safe-bottom` classes |
| Touch targets | `min-height: 44px` via `.touch-target` class |
| No horizontal overflow | `overflow-x: hidden` on html/body |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables all animations |
| Category selector | Horizontal scroll, touch-friendly, `min-height: 36px` per button |
| Sticky headers | `sticky top-0 z-40` in space pages |

### Optional enhancements (capable devices only)

- Tilt/parallax on hero visual (disabled for reduced motion)
- Spotlight cursor effect on landing (disabled for reduced motion)
- These must be disabled via `prefers-reduced-motion` and must not affect layout

---

## Stripe Checkout Requirements

### Architecture

- Checkout session is **server-side only** (`apps/worker/src/billing.ts`)
- `client_reference_id` = user ID (for webhook matching)
- `customer_email` passed if available
- `success_url` and `cancel_url` configured
- Webhook verifies raw body via HMAC-SHA256 (`STRIPE_WEBHOOK_SECRET`)
- D1 `users.tier` is the **source of truth** for entitlement
- Frontend **never** grants Pro by query param alone
- `?upgraded=1` query param is only a UI hint — tier is always re-fetched from server

### Free tier

- Free tier does not open Stripe
- No credit card required for free tier
- 5 sessions/day limit enforced server-side

### Pro upgrade flow

1. User clicks "Upgrade to Pro"
2. Frontend calls `POST /api/billing/checkout` (server-side)
3. Server creates Stripe Checkout session
4. User redirected to Stripe Checkout
5. Stripe processes payment
6. Stripe sends webhook to `POST /api/billing/webhook`
7. Webhook verifies signature, updates D1 `users.tier = 'pro'`
8. User redirected to `success_url` with `?upgraded=1`
9. Frontend re-fetches tier from server — confirms Pro

### Apple Pay

- Apple Pay is available through Stripe Checkout when:
  - Stripe account has Apple Pay enabled
  - Domain is verified with Apple Pay (Stripe handles this)
  - User device supports Apple Pay
  - Browser supports Apple Pay
- **Do not claim universal Apple Pay availability**
- Stripe Checkout shows Apple Pay automatically when conditions are met
- Manual card entry is always available as fallback

### Stripe Checkout branding

Configure in Stripe Dashboard → Settings → Branding:
- Business name: `Sovereign.os`
- Logo: brand-mark.svg (dark background version)
- Accent color: `#F6F5F3` (white) on dark background
- Background: `#05070B` (ink)
- Button color: `#F6F5F3`

---

## Gated / Incomplete Features

| Feature | Status | Gate |
|---|---|---|
| Defrag text input | ✅ Functional | Free (5/day) or Pro (unlimited) |
| Covenant space | ✅ Functional | Pro required |
| Category selector | ✅ UI complete | Sends category prefix to API |
| Image/screenshot upload | ⏳ Not built | Honest disabled state: "Image review is not fully available yet. Paste the message text here for now." |
| OCR/image review | ❌ Not available | Honest fallback only |
| Compare With Someone | ⏳ Not built | Two-person overlay notice: "I can work with your side of this. To compare both Baseline Designs, invite them privately." |
| Try It Out | ⏳ Not built | Pro gate in UpgradeModal |
| Watch It | ⏳ Not built | Pro gate in UpgradeModal |
| Audio overview | ⏳ Not built | Pro gate |
| Public Preview | ⏳ Not built | Future |
| Invite Privately | ⏳ Not built | Notice shown in Thread |
| Apple Pay | ⏳ Stripe-dependent | Available when Stripe + domain + device conditions met |
| PWA manifest | ⏳ Not built | Next sprint |
| apple-touch-icon | ⏳ Not built | Next sprint |

---

## Final Acceptance Checklist

- [ ] Hero: "Healing isn't optional. Holding the pain is." at primary entry
- [ ] No "Bring the moment here." anywhere
- [ ] No "Covenant is an optional reflection space inside Sovereign.os."
- [ ] No vague SaaS copy
- [ ] No amber/oxblood/brass accent drift
- [ ] Monochrome visual system throughout
- [ ] Fragment animation respects prefers-reduced-motion
- [ ] All inputs have font-size: 16px (iOS zoom prevention)
- [ ] Touch targets minimum 44px
- [ ] Safe area insets applied
- [ ] Stripe checkout is server-side only
- [ ] D1 is source of truth for entitlement
- [ ] Frontend never grants Pro by query param
- [ ] Image upload has honest gate
- [ ] Two-person overlay has honest gate
- [ ] OpenNext build passes
- [ ] Worker dry-run passes