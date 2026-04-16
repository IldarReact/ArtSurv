import { z } from 'zod'

import balanceData from '@/shared/data/world/business-balance.json'

export const BusinessBalanceSchema = z.object({
  elasticity: z.object({
    demandExponent: z.number().min(0),
    priceSliderStep: z.number().min(0),
    reputationSafetyBonus: z.number().min(0),
    safePriceThreshold: z.number().min(0).max(1),
  }),
  metrics: z.object({
    baseEfficiency: z.number().min(0),
    baseReputationBonus: z.number().min(0),
    efficiencyWeight: z.number().min(0).max(1),
    maxExpenseReduction: z.number().min(0).max(1),
    maxTaxReduction: z.number().min(0).max(1),
    minStaffEfficiencyReduction: z.number().min(0).max(1),
    minStaffingPenalty: z.number().min(0).max(1),
    reputationSmoothing: z.number().min(0).max(1),
    teamStarsWeight: z.number().min(0).max(1),
  }),
  production: z.object({
    baseProductDemandPerMaxEmp: z.number().min(0),
    baseProductionPerWorker: z.number().min(0),
    baseServiceDemandPerMaxEmp: z.number().min(0),
    baseServiceRevenuePerLevel: z.number().min(0),
  }),
  staffing: z.object({
    baseRentPerEmployee: z.number().min(0),
    baseUtilitiesPerEmployee: z.number().min(0),
    minFixedCosts: z.number().min(0),
    payrollTaxRate: z.number().min(0).max(100),
  }),
})

export type BusinessBalanceConfig = z.infer<typeof BusinessBalanceSchema>

// Runtime validation as required by Rules
const result = BusinessBalanceSchema.safeParse(balanceData)

if (!result.success) {
  // console.error('Business balance validation failed:', result.error.format())
  throw new Error('Critical error: Invalid business balance configuration')
}

export const BUSINESS_BALANCE: BusinessBalanceConfig = result.data
