import { z } from 'zod'

import {
  StatEffectSchema,
  StatsSchema,
  SkillLevelSchema,
  SkillRequirementSchema,
} from './base.schema'
import { BusinessSchema, FreelanceGigSchema, BusinessIdeaSchema } from './business.schema'
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
    role: z.string(), // Use string to avoid circular dependency with EmployeeRoleSchema if needed, but here it's fine
    salary: z.number().finite().min(0),
    kpiBonus: z.number().finite().min(0),
    description: z.string().optional(),
  })
  .strict()

export const PartnershipOfferDetailsSchema = z
  .object({
    businessId: z.string(),
    businessType: z.string(),
    businessName: z.string(),
    businessDescription: z.string(),
    totalCost: z.number().finite().min(0),
    partnerShare: z.number().finite().min(0).max(100),
    partnerInvestment: z.number().finite().min(0),
    yourShare: z.number().finite().min(0).max(100),
    yourInvestment: z.number().finite().min(0),
    employeeRoles: z.array(z.any()), // Simplified to avoid deep circularity
  })
  .strict()

export const ShareSaleOfferDetailsSchema = z
  .object({
    businessId: z.string(),
    businessName: z.string(),
    sharePercent: z.number().finite().min(0).max(100),
    price: z.number().finite().min(0),
    currentValue: z.number().finite().min(0),
  })
  .strict()

export const OfferStatusSchema = z.enum(['pending', 'accepted', 'rejected', 'expired', 'cancelled'])

export const BaseGameOfferSchema = z.object({
  id: z.string(),
  fromPlayerId: z.string(),
  fromPlayerName: z.string(),
  toPlayerId: z.string(),
  toPlayerName: z.string(),
  status: OfferStatusSchema,
  createdTurn: z.number().int().min(0),
  expiresInTurns: z.number().int().min(0),
  message: z.string().optional(),
})

export const JobOfferSchema = BaseGameOfferSchema.extend({
  type: z.literal('job_offer'),
  details: JobOfferDetailsSchema,
})

export const PartnershipOfferSchema = BaseGameOfferSchema.extend({
  type: z.literal('business_partnership'),
  details: PartnershipOfferDetailsSchema,
})

export const ShareSaleOfferSchema = BaseGameOfferSchema.extend({
  type: z.literal('share_sale'),
  details: ShareSaleOfferDetailsSchema,
})

export const GameOfferSchema = z.discriminatedUnion('type', [
  JobOfferSchema,
  PartnershipOfferSchema,
  ShareSaleOfferSchema,
])

// --- Skill Types ---

export const SkillDefinitionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    maxLevel: z.number().int().min(1).optional(),
    category: z.enum(['technical', 'creative', 'social', 'physical', 'language']).optional(),
  })
  .strict()

export const SkillSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    level: SkillLevelSchema,
    progress: z.number().finite().min(0).max(100),
    lastPracticedTurn: z.number().int().min(0),
    isBeingStudied: z.boolean().optional(),
    isBeingUsedAtWork: z.boolean().optional(),
  })
  .strict()

export const ActiveCourseSchema = z
  .object({
    id: z.string(),
    title: z.string().optional(), // New base field
    courseName: z.string(),
    skillName: z.string(),
    skillBonus: z.number().finite(),
    totalDuration: z.number().int().min(1),
    remainingDuration: z.number().int().min(0),
    costPerTurn: StatEffectSchema,
    startedTurn: z.number().int().min(0),
  })
  .strict()

export const ActiveUniversitySchema = z
  .object({
    id: z.string(),
    title: z.string().optional(), // New base field
    programName: z.string(),
    skillName: z.string(),
    skillBonus: z.number().finite(),
    totalDuration: z.number().int().min(1),
    remainingDuration: z.number().int().min(0),
    costPerTurn: StatEffectSchema,
    startedTurn: z.number().int().min(0),
  })
  .strict()

// --- Course Definition Types ---

export const CourseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    cost: z.number().finite().min(0),
    duration: z.number().int().min(1),
    skillName: z.string(),
    skillGain: z.number().finite().min(0),
    costPerTurn: StatEffectSchema.optional(),
    requirements: z
      .object({
        education: z.string().optional(),
        skills: z.array(z.object({ name: z.string(), level: z.number() })).optional(),
      })
      .optional(),
  })
  .strict()

// --- Job Types ---

export const JobRequirementsSchema = z
  .object({
    education: z.string().optional(),
    skills: z.array(z.object({ name: z.string(), level: z.number() })).optional(),
    experience: z.number().optional(),
  })
  .strict()

export const JobSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    company: z.string(),
    salary: z.number().finite().min(0),
    cost: StatEffectSchema,
    imageUrl: z.string(),
    description: z.string(),
    requirements: JobRequirementsSchema.optional(),
  })
  .strict()

// --- Housing Types ---

export const NearbyConstructionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    buildTime: z.number().int().min(1),
    currentProgress: z.number().int().min(0),
    effectDuringConstruction: StatEffectSchema,
    effectOnCompletion: StatEffectSchema,
    attractivenessBonus: z.number(),
  })
  .strict()

export const HousingOptionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['rent', 'mortgage', 'own']).default('rent'),
    subtype: z.string().default('apartment'),
    marketValue: z.number().finite().min(0).default(0),
    rentCostPerQuarter: z.number().finite().min(0).default(0),
    maintenanceCost: z.number().finite().min(0).default(0),
    capacity: z.number().int().min(1).default(1),
    effects: StatEffectSchema.default({}),
    attractiveness: z.number().finite().min(0).max(100).default(50),
    nearbyConstructions: z.array(NearbyConstructionSchema).default([]),
    isRentable: z.boolean().default(false),
    rentalIncomePerQuarter: z.number().finite().min(0).default(0),
    yearBuilt: z.number().int().optional(),
    imageUrl: z.string().optional(),
    isOwnedByPlayer: z.boolean().optional(),
    // Support for legacy JSON format
    price: z.number().optional(),
    costPerTurn: z.number().optional(),
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
    id: z.string(),
    title: z.string(),
    energyCost: z.number().finite(),
    effects: z.object({
      happiness: z.number().finite().optional(),
      health: z.number().finite().optional(),
      sanity: z.number().finite().optional(),
      intelligence: z.number().finite().optional(),
      energy: z.number().finite().optional(),
    }),
    cost: z.number().finite(),
    icon: z.string(),
    color: z.string(),
    bg: z.string(),
  })
  .strict()

// --- Character Data Types ---

export const CharacterSkillSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    level: z.number().int().min(1),
  })
  .strict()

export const CharacterDebtSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['mortgage', 'loan', 'credit_card', 'business_loan', 'tax_debt', 'student_loan']),
    principalAmount: z.number().finite().min(0),
    remainingAmount: z.number().finite().min(0),
    interestRate: z.number().finite().min(0),
    quarterlyPayment: z.number().finite().min(0),
    termQuarters: z.number().int().min(1),
    remainingQuarters: z.number().int().min(0),
  })
  .strict()

export const CharacterDataSchema = z
  .object({
    id: z.string(),
    archetype: z.string(),
    name: z.string(),
    description: z.string(),
    startingMoney: z.number().finite(),
    startingJobId: z.string().optional(),
    startingSalary: z.number().finite().default(0),
    startingStats: StatsSchema.omit({ money: true }),
    startingSkills: z.array(CharacterSkillSchema).optional(),
    startingDebts: z.array(CharacterDebtSchema).optional(),
    imageUrl: z.string(),
  })
  .strict()

// --- Player Types ---

export const PersonalLifeSchema = z
  .object({
    stats: StatsSchema,
    relations: z
      .object({
        family: z.number().finite().min(0).max(100),
        friends: z.number().finite().min(0).max(100),
        colleagues: z.number().finite().min(0).max(100),
      })
      .strict(),
    skills: z.array(SkillSchema),
    activeCourses: z.array(ActiveCourseSchema),
    activeUniversity: z.array(ActiveUniversitySchema),
    buffs: z.array(BuffSchema),
    familyMembers: z.array(FamilyMemberSchema),
    lifeGoals: z.array(LifeGoalSchema),
    isDating: z.boolean(),
    potentialPartner: PotentialPartnerSchema.nullable(),
    pregnancy: PregnancySchema.nullable(),
  })
  .strict()

export const PlayerSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    age: z.number().int().min(0),
    avatar: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']),
    currentJob: JobSchema.nullable(),
    residenceCountryId: z.string(),
    personalLife: PersonalLifeSchema,
    businesses: z.array(BusinessSchema),
    freelanceGigs: z.array(FreelanceGigSchema),
    businessIdeas: z.array(BusinessIdeaSchema),
    // Missing fields from Player interface
    assets: z.array(AssetSchema),
    debts: z.array(DebtSchema),
    quarterlyReport: QuarterlyReportSchema,
    creditScore: z.union([z.object({ value: z.number() }), z.number()]),
    quarterlySalary: z.number().finite(),
    stats: StatsSchema,
    multipliers: StatEffectSchema.optional(),
    happinessMultiplier: z.number().finite(),
    activeLifestyle: z.record(z.string(), z.string()),
    housingId: z.string(),
    traits: z.array(z.string()),
  })
  .strict()

// --- System Types ---

export const NotificationSchema = z
  .object({
    id: z.string(),
    type: z.enum([
      'job_offer',
      'job_rejection',
      'info',
      'promotion',
      'success',
      'warning',
      'error',
    ]),
    title: z.string(),
    message: z.string(),
    isRead: z.boolean(),
    date: z.string().optional(),
    data: z.unknown().optional(),
  })
  .strict()

export const PendingApplicationSchema = z
  .object({
    id: z.string(),
    jobTitle: z.string(),
    company: z.string(),
    salary: z.number().finite(),
    cost: StatEffectSchema,
    requirements: z.array(SkillRequirementSchema),
    daysPending: z.number().int(),
  })
  .strict()

export const PendingFreelanceApplicationSchema = z
  .object({
    id: z.string(),
    gigId: z.string(),
    title: z.string(),
    payment: z.number().finite(),
    cost: StatEffectSchema,
    requirements: z.array(SkillRequirementSchema),
  })
  .strict()

// --- Game State ---

export const GameStateSchema = z
  .object({
    turn: z.number().int().min(0),
    year: z.number().int().min(0),
    isProcessingTurn: z.boolean(),
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
    countries: z.record(z.string(), CountryEconomySchema),
    player: PlayerSchema.nullable(),
    history: z.array(
      z.object({
        turn: z.number().int().min(0),
        year: z.number().int().min(0),
        netWorth: z.number().finite(),
        happiness: z.number().finite().min(0).max(100),
        health: z.number().finite().min(0).max(100),
        eventDescription: z.string().optional(),
      }),
    ),
    activeActivity: z.string().nullable(),
    pendingEventNotification: GlobalEventSchema.nullable(),
    setupCountryId: z.string().nullable(),
    endReason: z
      .enum(['DEATH', 'MENTAL_BREAKDOWN', 'DEGRADATION', 'DEPRESSION', 'BANKRUPTCY'])
      .nullable(),
    notifications: z.array(NotificationSchema),
    pendingApplications: z.array(PendingApplicationSchema),
    pendingFreelanceApplications: z.array(PendingFreelanceApplicationSchema),
  })
  .strict()

export type GameState = z.infer<typeof GameStateSchema>
export type Player = z.infer<typeof PlayerSchema>
