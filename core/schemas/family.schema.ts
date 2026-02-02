import { z } from 'zod'

import { StatEffectSchema } from './base.schema'

export const BuffSchema = z
  .object({
    description: z.string(),
    duration: z.number().int(),
    effects: StatEffectSchema,
    id: z.string(),
    remainingDuration: z.number().int().min(0),
    source: z.string(),
    title: z.string(),
    totalDuration: z.number().int().min(1),
  })
  .strict()

export const LifeGoalSchema = z
  .object({
    description: z.string(),
    id: z.string(),
    isCompleted: z.boolean(),
    progress: z.number().finite(),
    requirements: z
      .object({
        cash: z.number().finite().optional(),
        hasCar: z.boolean().optional(),
        hasFamily: z.boolean().optional(),
        hasHouse: z.boolean().optional(),
        jobTitle: z.string().optional(),
        salary: z.number().finite().optional(),
        skillLevel: z.object({ level: z.number(), skill: z.string() }).optional(),
      })
      .optional(),
    reward: z.object({
      durationTurns: z.number().int(),
      perTurnReward: StatEffectSchema,
    }),
    target: z.number().finite(),
    title: z.string(),
    type: z.enum(['dream', 'goal']),
  })
  .strict()

export const FamilyMemberSchema = z
  .object({
    age: z.number().finite(),
    avatar: z.string().optional(),
    employedInBusinessId: z.string().optional(),
    expenses: z.number().finite(),
    expensesBreakdown: z
      .object({
        credits: z.number().finite(),
        food: z.number().finite(),
        housing: z.number().finite(),
        mortgage: z.number().finite(),
        other: z.number().finite(),
        total: z.number().finite(),
        transport: z.number().finite(),
      })
      .optional(),
    foodPreference: z.string().optional(),
    goals: z.array(LifeGoalSchema).optional(),
    id: z.string(),
    income: z.number().finite(),
    jobId: z.string().optional(),
    loyalty: z.number().finite().min(0).max(100).default(100),
    name: z.string(),
    occupation: z.string().optional(),
    passiveEffects: StatEffectSchema,
    relationLevel: z.number().finite().min(0).max(100),
    traits: z.array(z.string()).optional(),
    transportPreference: z.string().optional(),
    type: z.enum(['wife', 'husband', 'child', 'pet', 'parent', 'friend', 'colleague']),
  })
  .strict()

export const PotentialPartnerSchema = z
  .object({
    age: z.number().finite(),
    avatar: z.string().optional(),
    id: z.string(),
    income: z.number().finite(),
    name: z.string(),
    occupation: z.string(),
  })
  .strict()

export const PregnancySchema = z
  .object({
    id: z.string(),
    isTwins: z.boolean(),
    motherId: z.string(),
    remainingDuration: z.number().int().min(0),
    title: z.string(),
    totalDuration: z.number().int().min(1),
    turnsLeft: z.number().int().min(0),
  })
  .strict()
