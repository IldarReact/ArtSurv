import { z } from 'zod'

import { StatEffectSchema, SkillLevelSchema, SkillRequirementSchema } from './base.schema'

export const EmployeeRoleSchema = z.enum([
  'manager',
  'salesperson',
  'accountant',
  'marketer',
  'technician',
  'worker',
  'lawyer',
  'hr',
])

export const EmployeeSkillsSchema = z
  .object({
    efficiency: z.number().finite().min(0).max(100),
    loyalty: z.number().finite().min(0).max(100).optional(),
    stressResistance: z.number().finite().min(0).max(100).optional(),
  })
  .strict()

export const EmployeeSchema = z
  .object({
    avatar: z.string().optional(),
    effortPercent: z.number().finite().min(0).max(100).optional(),
    experience: z.number().int().min(0),
    familyMemberId: z.string().optional(),
    humanTraits: z.array(z.string()),
    id: z.string(),
    isFamilyMember: z.boolean().optional(),
    name: z.string(),
    productivity: z.number().finite().min(0).max(100),
    role: EmployeeRoleSchema,
    salary: z.number().finite().min(0),
    skills: EmployeeSkillsSchema,
    stars: SkillLevelSchema,
  })
  .strict()

export const BusinessPartnerSchema = z
  .object({
    id: z.string(),
    investedAmount: z.number().finite().min(0),
    name: z.string(),
    relation: z.number().finite().min(0).max(100),
    share: z.number().finite().min(0).max(100),
    type: z.enum(['player', 'npc']),
  })
  .strict()

export const BusinessProposalSchema = z
  .object({
    businessId: z.string(),
    changeType: z.string(),
    createdAt: z.number().int().min(0),
    data: z.record(z.string(), z.unknown()),
    id: z.string(),
    initiatorId: z.string(),
    initiatorName: z.string(),
    status: z.enum(['pending', 'approved', 'rejected']),
    votes: z.record(z.string(), z.boolean()).optional(),
  })
  .strict()

export const BusinessEventSchema = z
  .object({
    description: z.string(),
    effects: StatEffectSchema.and(
      z.object({
        efficiency: z.number().optional(),
        reputation: z.number().optional(),
      }),
    ),
    id: z.string(),
    title: z.string(),
    turn: z.number().int().min(0),
    type: z.enum(['positive', 'negative']),
  })
  .strict()

export const BusinessRoleConfigSchema = z.object({
  description: z.string(),
  priority: z.enum(['required', 'recommended', 'optional']),
  role: EmployeeRoleSchema,
})

export const BusinessGoalSchema = z.object({
  current: z.number().finite(),
  description: z.string(),
  id: z.string(),
  isCompleted: z.boolean(),
  target: z.number().finite(),
  title: z.string(),
  type: z.enum(['price', 'quantity', 'revenue', 'profit', 'efficiency', 'reputation']),
})

export const BusinessSchema = z
  .object({
    autoPurchaseAmount: z.number().finite().min(0),
    branches: z.array(z.string()).optional(),
    businessGoals: z.array(BusinessGoalSchema),
    createdAt: z.number().int().min(0),
    creationCost: StatEffectSchema,
    currentValue: z.number().finite().min(0),
    description: z.string(),
    efficiency: z.number().finite().min(0).max(100),
    employeeRoles: z.array(BusinessRoleConfigSchema),
    employees: z.array(EmployeeSchema),
    eventsHistory: z.array(BusinessEventSchema),
    foundedTurn: z.number().int().min(0),
    hasInsurance: z.boolean(),
    id: z.string(),
    imageUrl: z.string().optional(),
    initialCost: z.number().finite().min(0),
    insuranceCost: z.number().finite().min(0),
    inventory: z.object({
      autoPurchaseAmount: z.number().finite().min(0),
      currentStock: z.number().finite().min(0),
      maxStock: z.number().finite().min(0),
      pricePerUnit: z.number().finite().min(0),
      purchaseCost: z.number().finite().min(0),
    }),
    isMainBranch: z.boolean(),
    isServiceBased: z.boolean(),
    lastQuarterlyUpdate: z.number().int().min(0),
    lastQuarterSummary: z
      .object({
        efficiencyChange: z.number().optional(),
        expenses: z.number().finite(),
        expensesBreakdown: z
          .object({
            employees: z.number().finite(),
            equipment: z.number().finite(),
            inventory: z.number().finite(),
            marketing: z.number().finite(),
            other: z.number().finite(),
            rent: z.number().finite(),
          })
          .optional(),
        netProfit: z.number().finite(),
        priceUsed: z.number().finite(),
        profitDistribution: z
          .array(
            z.object({
              amount: z.number().finite(),
              partnerId: z.string(),
              share: z.number().finite(),
            }),
          )
          .optional(),
        reputationChange: z.number().optional(),
        salesIncome: z.number().finite(),
        sold: z.number().finite(),
        taxes: z.number().finite(),
      })
      .optional(),
    lastRoleEnergyCost: z.number().finite().optional(),
    lastRoleSanityCost: z.number().finite().optional(),
    maxEmployees: z.number().int().min(0),
    minEmployees: z.number().int().min(0),
    monthlyExpenses: z.number().finite(),
    monthlyIncome: z.number().finite(),
    name: z.string(),
    networkBonus: z
      .object({
        marketingBonus: z.number(),
        reputationBonus: z.number(),
      })
      .optional(),
    networkId: z.string().optional(),
    openingProgress: z
      .object({
        id: z.string(),
        investedAmount: z.number().finite().min(0),
        quartersLeft: z.number().int().min(0),
        remainingDuration: z.number().int().min(0),
        title: z.string(),
        totalCost: z.number().finite().min(0),
        totalDuration: z.number().int().min(0),
        totalQuarters: z.number().int().min(0),
        upfrontCost: z.number().finite().min(0),
      })
      .optional(),
    parentId: z.string().optional(),
    partnerBusinessId: z.string().optional(),
    partnerId: z.string().optional(),
    partnerName: z.string().optional(),
    partners: z.array(BusinessPartnerSchema),
    playerEmployment: z
      .object({
        effortPercent: z.number().finite().optional(),
        experience: z.number().int().min(0),
        productivity: z.number().finite().min(0).max(100).optional(),
        role: EmployeeRoleSchema,
        salary: z.number().finite().min(0),
        startedTurn: z.number().int().min(0),
      })
      .optional(),
    playerInvestment: z.number().finite().optional(),
    playerRoles: z.object({
      managerialRoles: z.array(EmployeeRoleSchema),
      operationalRole: EmployeeRoleSchema.nullable(),
    }),
    playerShare: z.number().finite().optional(),
    price: z.number().finite().min(0),
    proposals: z.array(BusinessProposalSchema),
    quantity: z.number().finite().min(0),
    quarterlyExpenses: z.number().finite(),
    quarterlyIncome: z.number().finite(),
    quarterlyTax: z.number().finite(),
    reputation: z.number().finite().min(0).max(100),
    state: z.enum(['opening', 'active', 'frozen']),
    taxRate: z.number().finite().min(0).max(100),
    type: z.enum(['retail', 'service', 'cafe', 'tech', 'manufacturing', 'food']),
    valuation: z.number().finite().min(0),
    walletBalance: z.number().finite().optional(),
  })
  .strict()

export const FreelanceGigSchema = z
  .object({
    category: z.string(),
    cost: StatEffectSchema,
    description: z.string().optional(),
    duration: z.number().int().min(1).default(1),
    id: z.string(),
    imageUrl: z.string().optional(),
    payment: z.number().finite().min(0),
    requirements: z.array(SkillRequirementSchema),
    title: z.string(),
  })
  .strict()

export const BusinessIdeaSchema = z
  .object({
    description: z.string(),
    developmentProgress: z.number().finite().min(0).max(100),
    expiresIn: z.number().int().min(0),
    generatedTurn: z.number().int().min(0),
    id: z.string(),
    investedAmount: z.number().finite().min(0),
    marketDemand: z.number().finite().min(0).max(100),
    maxInvestment: z.number().finite().min(0),
    minInvestment: z.number().finite().min(0),
    name: z.string(),
    potentialReturn: z.number().finite(),
    requiredSkills: z.array(SkillRequirementSchema),
    riskLevel: z.enum(['low', 'medium', 'high', 'very_high']),
    stage: z.enum(['idea', 'prototype', 'mvp', 'launched']),
    type: z.enum(['retail', 'service', 'cafe', 'tech', 'manufacturing', 'food']),
  })
  .strict()

export const StaffImpactResultSchema = z
  .object({
    creativity: z.number().optional(),
    efficiency: z.number().optional(),
    efficiencyBase: z.number().optional(),
    efficiencyMultiplier: z.number().optional(),
    expenseReduction: z.number().optional(),
    legalProtection: z.number().optional(),
    // Data from employee-data.json
    management: z.number().optional(),
    reputationBonus: z.number().optional(),
    salesAbility: z.number().optional(),
    salesBonus: z.number().optional(),
    staffProductivityBonus: z.number().optional(),
    taxReduction: z.number().optional(),
    technical: z.number().optional(),
  })
  .strict()

export const EmployeeDataSchema = z
  .object({
    baseSalaries: z.record(z.string(), z.number().finite().min(0)),
    firstNames: z.array(z.string()),
    humanTraits: z.array(z.string()),
    lastNames: z.array(z.string()),
    roleDescriptions: z.record(
      z.string(),
      z.object({
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
      }),
    ),
    roleModifiers: z.record(z.string(), StaffImpactResultSchema),
    starMultipliers: z.array(z.number().finite().min(0)),
  })
  .strict()

// --- Business Idea Templates (for loaders) ---

export const IdeaTemplateSchema = z
  .object({
    descriptionTemplates: z.array(z.string()),
    investmentRange: z.tuple([z.number().finite(), z.number().finite()]),
    nameTemplates: z.array(z.string()),
    requiredSkills: z.array(SkillRequirementSchema),
    returnRange: z.tuple([z.number().finite(), z.number().finite()]),
    riskRange: z.tuple([
      z.enum(['low', 'medium', 'high', 'very_high']),
      z.enum(['low', 'medium', 'high', 'very_high']),
    ]),
    type: z.enum(['retail', 'service', 'cafe', 'tech', 'manufacturing', 'food']),
  })
  .strict()

export const IdeaReplacementsSchema = z.record(z.string(), z.array(z.string())).and(
  z.object({
    categories: z.array(z.string()),
    fields: z.array(z.string()),
    niches: z.array(z.string()),
    products: z.array(z.string()),
  }),
)

// --- Business Template Types (for loaders) ---

export const BusinessTemplateSchema = z
  .object({
    description: z.string().optional(),
    employeeRoles: z.array(
      z.object({
        description: z.string(),
        priority: z.enum(['required', 'recommended', 'optional']),
        role: EmployeeRoleSchema,
      }),
    ),
    energyCost: z.number().finite().optional(),
    id: z.string(),
    imageUrl: z.string().optional(),
    initialCost: z.number().finite().min(0),
    inventory: z
      .object({
        autoPurchaseAmount: z.number().finite().min(0),
        maxStock: z.number().finite().min(0),
        pricePerUnit: z.number().finite().min(0),
        purchaseCost: z.number().finite().min(0),
      })
      .optional(),
    isServiceBased: z.boolean(),
    maxEmployees: z.number().int().min(0),
    minEmployees: z.number().int().min(0),
    monthlyExpenses: z.number().finite(),
    monthlyIncome: z.number().finite(),
    name: z.string(),
    openingQuarters: z.number().int().min(0),
    price: z.number().finite().min(0),
    quantity: z.number().finite().min(0),
    risk: z.enum(['low', 'medium', 'high']),
    stressImpact: z.number().finite().optional(),
    type: z.enum(['retail', 'service', 'cafe', 'tech', 'manufacturing', 'food']),
    upfrontCost: z.number().finite().min(0),
    upfrontPaymentPercentage: z.number().finite().min(0).max(100).optional(),
  })
  .strict()
