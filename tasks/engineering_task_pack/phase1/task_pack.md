# Phase 1 Task Pack

## API Request/Response JSON
- **Create Space**
  - POST `/api/v1/spaces`
  - Request: `{ "name": "string", "tier": "defrag" | "alignment" | "covenant" }`
  - Response: `{ "id": "string", "status": "active", "tier": "string" }`

## DB Migration Stubs
- `20231027_add_tiers_to_spaces.sql`: Adds `tier` enum and column to `spaces` table.
- `20231027_add_entitlements_table.sql`: Creates `entitlements` table for feature flags.

## List of Files to Implement
- `apps/web/components/SpaceSelector.tsx`: UI for choosing space tier.
- `packages/core/services/SpaceService.ts`: Business logic for space creation and tier limits.
- `lib/db/schema.prisma`: Schema updates for spaces and entitlements.

## E2E Scenarios
1. **Free Tier Onboarding**: User creates a Defrag space and sees default search limits.
2. **Pro Upgrade Flow**: User upgrades to Alignment via Stripe and unlocks advanced agents.
3. **Secure Space Access**: User creates a Covenant space, triggers KMS key generation, and accesses encrypted data.
