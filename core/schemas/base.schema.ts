import { z } from 'zod'

export const StatEffectSchema = z
  .object({
    energy: z.number().finite().optional(),
    happiness: z.number().finite().optional(),
    health: z.number().finite().optional(),
    intelligence: z.number().finite().optional(),
    money: z.number().finite().optional(),
    sanity: z.number().finite().optional(),
  })
  .strict()

const STAT_MIN = 0
const STAT_MAX = 100

export const StatsSchema = z
  .object({
    energy: z.number().finite().min(STAT_MIN).max(STAT_MAX),
    happiness: z.number().finite().min(STAT_MIN).max(STAT_MAX),
    health: z.number().finite().min(STAT_MIN).max(STAT_MAX),
    intelligence: z.number().finite().min(STAT_MIN).max(STAT_MAX),
    money: z.number().finite(),
    sanity: z.number().finite().min(STAT_MIN).max(STAT_MAX),
  })
  .strict()

const SKILL_LEVEL_0 = 0
const SKILL_LEVEL_1 = 1
const SKILL_LEVEL_2 = 2
const SKILL_LEVEL_3 = 3
const SKILL_LEVEL_4 = 4
const SKILL_LEVEL_5 = 5

export const SkillLevelSchema = z.union([
  z.literal(SKILL_LEVEL_0),
  z.literal(SKILL_LEVEL_1),
  z.literal(SKILL_LEVEL_2),
  z.literal(SKILL_LEVEL_3),
  z.literal(SKILL_LEVEL_4),
  z.literal(SKILL_LEVEL_5),
])

export const SkillRequirementSchema = z
  .object({
    minLevel: SkillLevelSchema,
    skillId: z.string(),
  })
  .strict()
