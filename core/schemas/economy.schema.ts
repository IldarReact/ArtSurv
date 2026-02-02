import { z } from 'zod'

export const EconomicEventSchema = z
  .object({
    description: z.string(),
    duration: z.number().int(),
    effects: z.object({
      gdpGrowthChange: z.number().optional(),
      inflationChange: z.number().optional(),
      keyRateChange: z.number().optional(),
      salaryModifierChange: z.number().optional(),
      unemploymentChange: z.number().optional(),
    }),
    id: z.string(),
    title: z.string(),
    turn: z.number().int(),
    type: z.enum(['crisis', 'boom', 'recession', 'inflation_spike', 'rate_hike', 'rate_cut']),
  })
  .strict()

export const CountryEconomySchema = z
  .object({
    activeEvents: z.array(EconomicEventSchema),
    archetype: z.string(),
    baseSalaries: z.record(z.string(), z.number()).optional(),
    baseYear: z.number().optional(),
    corporateTaxRate: z.number(),
    costOfLivingModifier: z.number(),
    gdpGrowth: z.number(),
    id: z.string(),
    imageUrl: z.string().optional(),
    inflation: z.number(),
    inflationHistory: z.array(z.number()).optional(),
    interestRate: z.number().optional(),
    keyRate: z.number(),
    name: z.string(),
    salaryModifier: z.number(),
    stockMarketInflation: z.number(),
    taxRate: z.number(),
    unemployment: z.number(),
  })
  .passthrough()

export const GlobalEventSchema = z
  .object({
    description: z.string(),
    id: z.string(),
    impact: z.object({
      gdp: z.number().optional(),
      inflation: z.number().optional(),
      market: z.number().optional(),
    }),
    title: z.string(),
  })
  .strict()
