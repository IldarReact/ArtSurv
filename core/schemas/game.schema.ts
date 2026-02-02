import { z } from 'zod'

import {
  StatEffectSchema,
  StatsSchema,
  SkillLevelSchema,
  SkillRequirementSchema,
} from './base.schema'
import {
  BusinessSchema,
  FreelanceGigSchema,
  BusinessIdeaSchema,
  BusinessRoleConfigSchema,
} from './business.schema'
import { CountryEconomySchema, GlobalEventSchema } from './economy.schema'
import {
  BuffSchema,
  FamilyMemberSchema,
  LifeGoalSchema,
  PotentialPartnerSchema,
  PregnancySchema,
} from './family.schema'
import { AssetSchema, DebtSchema, QuarterlyReportSchema } from './finance.schema'

// Re-export for convenience if needed elsewhere
export * from './base.schema'
export * from './business.schema'
export * from './family.schema'
export * from './economy.schema'
export * from './finance.schema'

// --- Game Offers ---

export const JobOfferDetailsSchema = z
  .object({
    businessId: z.string(),
    businessName: z.string(),
    description: z.string().optional(),
    kpiBonus: z.number().finite().min(0),
    role: z.string(), // Use string to avoid circular dependency with EmployeeRoleSchema if needed, but here it's fine
    salary: z.number().finite().min(0),
  })
  .strict()

const SHARE_MIN = 0
const SHARE_MAX = 100

export const PartnershipOfferDetailsSchema = z
  .object({
    businessDescription: z.string(),
    businessId: z.string(),
    businessName: z.string(),
    businessType: z.string(),
    employeeRoles: z.array(BusinessRoleConfigSchema), // Using proper schema instead of z.any()
    partnerInvestment: z.number().finite().min(0),
    partnerShare: z.number().finite().min(SHARE_MIN).max(SHARE_MAX),
    totalCost: z.number().finite().min(0),
    yourInvestment: z.number().finite().min(0),
    yourShare: z.number().finite().min(SHARE_MIN).max(SHARE_MAX),
  })
  .strict()

export const ShareSaleOfferDetailsSchema = z
  .object({
    businessId: z.string(),
    businessName: z.string(),
    currentValue: z.number().finite().min(0),
    price: z.number().finite().min(0),
    sharePercent: z.number().finite().min(SHARE_MIN).max(SHARE_MAX),
  })
  .strict()

export const OfferStatusSchema = z.enum(['pending', 'accepted', 'rejected', 'expired', 'cancelled'])

const TURN_MIN = 0
const STAT_MIN = 0
const STAT_MAX = 100

export const BaseGameOfferSchema = z.object({
  createdTurn: z.number().int().min(TURN_MIN),
  expiresInTurns: z.number().int().min(TURN_MIN),
  fromPlayerId: z.string(),
  fromPlayerName: z.string(),
  id: z.string(),
  message: z.string().optional(),
  status: OfferStatusSchema,
  toPlayerId: z.string(),
  toPlayerName: z.string(),
})

export const JobOfferSchema = BaseGameOfferSchema.extend({
  details: JobOfferDetailsSchema,
  type: z.literal('job_offer'),
})

export const PartnershipOfferSchema = BaseGameOfferSchema.extend({
  details: PartnershipOfferDetailsSchema,
  type: z.literal('business_partnership'),
})

export const ShareSaleOfferSchema = BaseGameOfferSchema.extend({
  details: ShareSaleOfferDetailsSchema,
  type: z.literal('share_sale'),
})

export const GameOfferSchema = z.discriminatedUnion('type', [
  JobOfferSchema,
  PartnershipOfferSchema,
  ShareSaleOfferSchema,
])

// --- Skill Types ---

export const SkillDefinitionSchema = z
  .object({
    category: z.enum(['technical', 'creative', 'social', 'physical', 'language']).optional(),
    description: z.string(),
    id: z.string(),
    maxLevel: z.number().int().min(1).optional(),
    name: z.string(),
  })
  .strict()

export const SkillSchema = z
  .object({
    id: z.string(),
    isBeingStudied: z.boolean().optional(),
    isBeingUsedAtWork: z.boolean().optional(),
    lastPracticedTurn: z.number().int().min(0),
    level: SkillLevelSchema,
    name: z.string(),
    progress: z.number().finite().min(0).max(100),
  })
  .strict()

export const ActiveCourseSchema = z
  .object({
    costPerTurn: StatEffectSchema,
    courseName: z.string(),
    id: z.string(),
    remainingDuration: z.number().int().min(0),
    skillBonus: z.number().finite(),
    skillName: z.string(),
    startedTurn: z.number().int().min(0),
    title: z.string().optional(), // New base field
    totalDuration: z.number().int().min(1),
  })
  .strict()

export const ActiveUniversitySchema = z
  .object({
    costPerTurn: StatEffectSchema,
    id: z.string(),
    programName: z.string(),
    remainingDuration: z.number().int().min(0),
    skillBonus: z.number().finite(),
    skillName: z.string(),
    startedTurn: z.number().int().min(0),
    title: z.string().optional(), // New base field
    totalDuration: z.number().int().min(1),
  })
  .strict()

// --- Course Definition Types ---

export const CourseSchema = z
  .object({
    cost: z.number().finite().min(0),
    costPerTurn: StatEffectSchema.optional(),
    description: z.string().optional(),
    duration: z.number().int().min(1),
    id: z.string(),
    name: z.string(),
    requirements: z
      .object({
        education: z.string().optional(),
        skills: z.array(z.object({ level: z.number(), name: z.string() })).optional(),
      })
      .optional(),
    skillGain: z.number().finite().min(0),
    skillName: z.string(),
  })
  .strict()

// --- Job Types ---

export const JobRequirementsSchema = z
  .object({
    education: z.string().optional(),
    experience: z.number().optional(),
    skills: z.array(z.object({ level: z.number(), name: z.string() })).optional(),
  })
  .strict()

export const JobSchema = z
  .object({
    category: z.string().optional(),
    company: z.string(),
    cost: StatEffectSchema,
    description: z.string().optional(),
    id: z.string(),
    imageUrl: z.string(),
    requirements: JobRequirementsSchema.optional(),
    salary: z.number().finite().min(0),
    title: z.string(),
  })
  .strict()

// --- Housing Types ---

export const NearbyConstructionSchema = z
  .object({
    attractivenessBonus: z.number(),
    buildTime: z.number().int().min(1),
    currentProgress: z.number().int().min(0),
    effectDuringConstruction: StatEffectSchema,
    effectOnCompletion: StatEffectSchema,
    id: z.string(),
    name: z.string(),
  })
  .strict()

const ATTRACTIVENESS_DEFAULT = 50

export const HousingOptionSchema = z
  .object({
    attractiveness: z.number().finite().min(STAT_MIN).max(STAT_MAX).default(ATTRACTIVENESS_DEFAULT),
    capacity: z.number().int().min(1).default(1),
    costPerTurn: z.number().optional(),
    description: z.string(),
    effects: StatEffectSchema.default({}),
    id: z.string(),
    imageUrl: z.string().optional(),
    isOwnedByPlayer: z.boolean().optional(),
    isRentable: z.boolean().default(false),
    maintenanceCost: z.number().finite().min(0).default(0),
    marketValue: z.number().finite().min(0).default(0),
    name: z.string(),
    nearbyConstructions: z.array(NearbyConstructionSchema).default([]),
    // Support for legacy JSON format
    price: z.number().optional(),
    rentalIncomePerQuarter: z.number().finite().min(0).default(0),
    rentCostPerQuarter: z.number().finite().min(0).default(0),
    subtype: z.string().default('apartment'),
    type: z.enum(['rent', 'mortgage', 'own']).default('rent'),
    yearBuilt: z.number().int().optional(),
  })
  .transform((data) => {
    // Map legacy fields to new fields if necessary
    if (data.price !== undefined && data.marketValue === 0) {
      data.marketValue = data.price
    }
    if (data.costPerTurn !== undefined && data.rentCostPerQuarter === 0) {
      data.rentCostPerQuarter = data.costPerTurn
    }
    // Infer type if missing
    if (data.price !== undefined) {
      data.type = 'own'
    } else if (data.costPerTurn !== undefined) {
      data.type = 'rent'
    }
    return data
  })

// --- Rest Activity Types ---

export const RestActivitySchema = z
  .object({
    bg: z.string(),
    color: z.string(),
    cost: z.number().finite(),
    effects: z.object({
      energy: z.number().finite().optional(),
      happiness: z.number().finite().optional(),
      health: z.number().finite().optional(),
      intelligence: z.number().finite().optional(),
      sanity: z.number().finite().optional(),
    }),
    energyCost: z.number().finite(),
    icon: z.string(),
    id: z.string(),
    title: z.string(),
  })
  .strict()

// --- Character Data Types ---

export const CharacterSkillSchema = z
  .object({
    id: z.string(),
    level: z.number().int().min(1),
    name: z.string(),
  })
  .strict()

export const CharacterDebtSchema = z
  .object({
    id: z.string(),
    interestRate: z.number().finite().min(0),
    name: z.string(),
    principalAmount: z.number().finite().min(0),
    quarterlyPayment: z.number().finite().min(0),
    remainingAmount: z.number().finite().min(0),
    remainingQuarters: z.number().int().min(0),
    termQuarters: z.number().int().min(1),
    type: z.enum(['mortgage', 'loan', 'credit_card', 'business_loan', 'tax_debt', 'student_loan']),
  })
  .strict()

export const CharacterDataSchema = z
  .object({
    archetype: z.string(),
    description: z.string(),
    id: z.string(),
    imageUrl: z.string(),
    name: z.string(),
    startingDebts: z.array(CharacterDebtSchema).optional(),
    startingJobId: z.string().optional(),
    startingMoney: z.number().finite(),
    startingSalary: z.number().finite().default(0),
    startingSkills: z.array(CharacterSkillSchema).optional(),
    startingStats: StatsSchema.omit({ money: true }),
  })
  .strict()

// --- Player Types ---

export const PersonalLifeSchema = z
  .object({
    activeCourses: z.array(ActiveCourseSchema),
    activeUniversity: z.array(ActiveUniversitySchema),
    buffs: z.array(BuffSchema),
    familyMembers: z.array(FamilyMemberSchema),
    isDating: z.boolean(),
    lifeGoals: z.array(LifeGoalSchema),
    potentialPartner: PotentialPartnerSchema.nullable(),
    pregnancy: PregnancySchema.nullable(),
    relations: z
      .object({
        colleagues: z.number().finite().min(0).max(100),
        family: z.number().finite().min(0).max(100),
        friends: z.number().finite().min(0).max(100),
      })
      .strict(),
    skills: z.array(SkillSchema),
    stats: StatsSchema,
  })
  .strict()

export const PlayerSchema = z
  .object({
    activeLifestyle: z.record(z.string(), z.string().optional()),
    age: z.number().int().min(0),
    // Missing fields from Player interface
    assets: z.array(AssetSchema),
    avatar: z.string().optional(),
    businesses: z.array(BusinessSchema),
    businessIdeas: z.array(BusinessIdeaSchema),
    countryId: z.string(),
    creditScore: z.union([z.object({ value: z.number() }), z.number()]),
    currentJob: JobSchema.nullable(),
    debts: z.array(DebtSchema),
    freelanceGigs: z.array(FreelanceGigSchema),
    gender: z.enum(['male', 'female', 'other']),
    happinessMultiplier: z.number().finite(),
    housingId: z.string(),
    id: z.string(),
    multipliers: StatEffectSchema.optional(),
    name: z.string(),
    personal: PersonalLifeSchema,
    quarterlyReport: QuarterlyReportSchema,
    quarterlySalary: z.number().finite(),
    stats: StatsSchema,
    traits: z.array(z.string()),
  })
  .strict()

// --- System Types ---

export const NotificationSchema = z
  .object({
    data: z.unknown().optional(),
    date: z.string().optional(),
    id: z.string(),
    isRead: z.boolean(),
    message: z.string(),
    title: z.string(),
    type: z.enum([
      'job_offer',
      'job_rejection',
      'info',
      'promotion',
      'success',
      'warning',
      'error',
    ]),
  })
  .strict()

export const PendingApplicationSchema = z
  .object({
    company: z.string(),
    cost: StatEffectSchema,
    daysPending: z.number().int(),
    id: z.string(),
    jobTitle: z.string(),
    requirements: z.array(SkillRequirementSchema),
    salary: z.number().finite(),
  })
  .strict()

export const PendingFreelanceApplicationSchema = z
  .object({
    cost: StatEffectSchema,
    gigId: z.string(),
    id: z.string(),
    payment: z.number().finite(),
    requirements: z.array(SkillRequirementSchema),
    title: z.string(),
  })
  .strict()

// --- Game State ---

export const GameStateSchema = z
  .object({
    activeActivity: z.string().nullable(),
    countries: z.record(z.string(), CountryEconomySchema),
    endReason: z
      .enum(['DEATH', 'MENTAL_BREAKDOWN', 'DEGRADATION', 'DEPRESSION', 'BANKRUPTCY'])
      .nullable(),
    gameStatus: z.enum([
      'menu',
      'setup',
      'select_country',
      'select_character',
      'playing',
      'year_report',
      'ended',
    ]),
    globalEvents: z.array(GlobalEventSchema),
    history: z.array(
      z.object({
        eventDescription: z.string().optional(),
        happiness: z.number().finite().min(STAT_MIN).max(STAT_MAX),
        health: z.number().finite().min(STAT_MIN).max(STAT_MAX),
        netWorth: z.number().finite(),
        turn: z.number().int().min(TURN_MIN),
        year: z.number().int().min(0),
      }),
    ),
    isProcessingTurn: z.boolean(),
    notifications: z.array(NotificationSchema),
    pendingApplications: z.array(PendingApplicationSchema),
    pendingEventNotification: GlobalEventSchema.nullable(),
    pendingFreelanceApplications: z.array(PendingFreelanceApplicationSchema),
    player: PlayerSchema.nullable(),
    setupCountryId: z.string().nullable(),
    turn: z.number().int().min(0),
    year: z.number().int().min(0),
  })
  .strict()

export type GameState = z.infer<typeof GameStateSchema>
export type Player = z.infer<typeof PlayerSchema>
