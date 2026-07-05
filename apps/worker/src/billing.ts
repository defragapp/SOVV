
/**
 * SOVV Phase 1: Standardized Entitlements
 */
export async function checkSpaceEntitlement(db: any, spaceId: string, feature: string): Promise<boolean> {
  const [space] = await db.select().from(spaces).where(eq(spaces.id, spaceId)).limit(1);
  if (!space) return false;
  return space.tier === 'pro' || (space.entitlements as any)?.[feature] === true;
}
