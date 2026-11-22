import { z } from 'zod'

export const EconomicEventSchema = z
  .object({
    appliedChanges: z
      .object({
        corporateTaxRate: z
          .object({ delta: z.number(), from: z.number(), to: z.number() })
          .strict()
          .optional(),
        gdpGrowth: z
          .object({ delta: z.number(), from: z.number(), to: z.number() })
          .strict()
          .optional(),
        inflation: z
          .object({ delta: z.number(), from: z.number(), to: z.number() })
          .strict()
          .optional(),
        keyRate: z
          .object({ delta: z.number(), from: z.number(), to: z.number() })
          .strict()
          .optional(),
        personalTaxRate: z
          .object({ delta: z.number(), from: z.number(), to: z.number() })
          .strict()
          .optional(),
        psychologicalStability: z
          .object({ delta: z.number(), from: z.number(), to: z.number() })
          .strict()
          .optional(),
        salaryModifier: z
          .object({ delta: z.number(), from: z.number(), to: z.number() })
          .strict()
          .optional(),
        unemployment: z
          .object({ delta: z.number(), from: z.number(), to: z.number() })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
    description: z.string(),
    duration: z.number().int(),
    effects: z.object({
      corporateTaxRateChange: z.number().optional(),
      gdpGrowthChange: z.number().optional(),
      inflationChange: z.number().optional(),
      keyRateChange: z.number().optional(),
      personalTaxRateChange: z.number().optional(),
      psychologicalStabilityChange: z.number().optional(),
      salaryModifierChange: z.number().optional(),
      unemploymentChange: z.number().optional(),
    }),
    id: z.string(),
    title: z.string(),
    turn: z.number().int(),
    type: z.enum([
      'crisis',
      'boom',
      'recession',
      'inflation_spike',
      'rate_hike',
      'rate_cut',
      'tax_reform',
    ]),
  })
  .strict()

export const EconomicEventDefinitionSchema = EconomicEventSchema.omit({
  appliedChanges: true,
  id: true,
  turn: true,
})

export const CountryEconomySchema = z
  .object({
    activeEvents: z.array(EconomicEventSchema),
    archetype: z.string(),
    baseSalaries: z.record(z.string(), z.number()).optional(),
    baseYear: z.number().optional(),
    corporateTaxRate: z.number(),
    costOfLivingModifier: z.number(),
    eventHistory: z.array(EconomicEventSchema).optional(),
    gdpGrowth: z.number(),
    id: z.string(),
    imageUrl: z.string().optional(),
    inflation: z.number(),
    inflationHistory: z.array(z.number()).optional(),
    interestRate: z.number().optional(),
    keyRate: z.number(),
    name: z.string(),
    psychologicalStability: z.number().finite().min(0).max(100).default(50),
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
