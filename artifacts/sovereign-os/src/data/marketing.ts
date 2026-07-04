/**
 * Marketing constants shared across pricing UI, upgrade banners, and checkout flows.
 * The Stripe price ID is read from the Vite env at build time.
 */
export const PRICING_CONFIG = {
  pro: {
    price: '$12',
    period: 'mo',
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID as string ?? '',
  },
} as const
