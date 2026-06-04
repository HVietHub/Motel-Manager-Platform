/**
 * Pricing plan constants — single source of truth for plan limits in code.
 * Mirrors docs/PRICING_PLANS.md
 */

export enum PlanTier {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
}

export interface PlanLimits {
  maxBuildings: number   // -1 = unlimited
  maxRooms: number       // -1 = unlimited
  priceVnd: number       // monthly price in VND (0 = free)
  features: PlanFeatures
}

export interface PlanFeatures {
  autoInvoice: boolean
  emailNotifications: boolean
  reports: boolean
  communityPosts: boolean
  apiAccess: boolean
  webhooks: boolean
  exportData: boolean
  advancedAnalytics: boolean
  aiChatbot: boolean
  aiPredictions: boolean
  multiUser: boolean
  whiteLabel: boolean
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  [PlanTier.FREE]: {
    maxBuildings: 1,
    maxRooms: 4,
    priceVnd: 0,
    features: {
      autoInvoice: false,
      emailNotifications: false,
      reports: false,
      communityPosts: false,
      apiAccess: false,
      webhooks: false,
      exportData: false,
      advancedAnalytics: false,
      aiChatbot: false,
      aiPredictions: false,
      multiUser: false,
      whiteLabel: false,
    },
  },

  [PlanTier.STARTER]: {
    maxBuildings: 2,
    maxRooms: 20,
    priceVnd: 99_000,
    features: {
      autoInvoice: false,
      emailNotifications: true,
      reports: true,
      communityPosts: true,
      apiAccess: false,
      webhooks: false,
      exportData: false,
      advancedAnalytics: false,
      aiChatbot: false,
      aiPredictions: false,
      multiUser: false,
      whiteLabel: false,
    },
  },

  [PlanTier.PRO]: {
    maxBuildings: 5,
    maxRooms: 50,
    priceVnd: 249_000,
    features: {
      autoInvoice: true,
      emailNotifications: true,
      reports: true,
      communityPosts: true,
      apiAccess: true,
      webhooks: true,
      exportData: true,
      advancedAnalytics: true,
      aiChatbot: true,
      aiPredictions: false,
      multiUser: false,
      whiteLabel: false,
    },
  },
}

/** Default plan assigned to new landlords */
export const DEFAULT_PLAN = PlanTier.FREE

/**
 * Returns true if the given plan has access to a specific feature.
 */
export function planHasFeature(plan: PlanTier, feature: keyof PlanFeatures): boolean {
  return PLAN_LIMITS[plan].features[feature]
}

/**
 * Returns true if the given plan allows adding more buildings.
 */
export function canAddBuilding(plan: PlanTier, currentBuildingCount: number): boolean {
  const limit = PLAN_LIMITS[plan].maxBuildings
  return limit === -1 || currentBuildingCount < limit
}

/**
 * Returns true if the given plan allows adding more rooms (across all buildings).
 */
export function canAddRoom(plan: PlanTier, currentRoomCount: number): boolean {
  const limit = PLAN_LIMITS[plan].maxRooms
  return limit === -1 || currentRoomCount < limit
}
