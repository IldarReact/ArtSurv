import { z } from 'zod'

export const AssetTypeSchema = z.enum(['housing', 'real_estate', 'stock', 'business', 'deposit'])
export const DebtTypeSchema = z.enum(['mortgage', 'consumer_credit', 'student_loan'])

export const AssetSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: AssetTypeSchema,
    value: z.number(),
    currentValue: z.number(),
    purchasePrice: z.number(),
    unrealizedGain: z.number(),
    income: z.number(),
    expenses: z.number(),
    risk: z.enum(['low', 'medium', 'high']),
    liquidity: z.enum(['low', 'medium', 'high']),
    stockSymbol: z.string().optional(),
    quantity: z.number().optional(),
    lastSoldPrice: z.number().optional(),
    soldAt: z.number().optional(),
  })
  .strict()

export const DebtSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    type: DebtTypeSchema,
    principalAmount: z.number(),
    remainingAmount: z.number(),
    interestRate: z.number(),
    quarterlyPayment: z.number(),
    quarterlyPrincipal: z.number(),
    quarterlyInterest: z.number(),
    termQuarters: z.number(),
    remainingQuarters: z.number(),
    startTurn: z.number(),
  })
  .strict()

export const IncomeBreakdownSchema = z
  .object({
    salary: z.number(),
    businessRevenue: z.number(),
    familyIncome: z.number(),
    assetIncome: z.number(),
    capitalGains: z.number(),
    total: z.number(),
  })
  .strict()

export const ExpensesBreakdownSchema = z
  .object({
    living: z.number(),
    food: z.number(),
    housing: z.number(),
    transport: z.number(),
    credits: z.number(),
    mortgage: z.number(),
    other: z.number(),
    family: z.number(),
    business: z.number(),
    debtInterest: z.number(),
    assetMaintenance: z.number(),
    total: z.number(),
  })
  .strict()

export const TaxesBreakdownSchema = z
  .object({
    income: z.number(),
    business: z.number(),
    capital: z.number(),
    property: z.number(),
    total: z.number(),
  })
  .strict()

export const QuarterlyReportSchema = z
  .object({
    income: IncomeBreakdownSchema,
    expenses: ExpensesBreakdownSchema,
    taxes: TaxesBreakdownSchema,
    netProfit: z.number(),
    warning: z.string().nullable(),
  })
  .strict()

// --- Shop Types ---

export const ShopCategorySchema = z.enum(['food', 'transport', 'health', 'services', 'housing'])

export const ShopItemSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    category: ShopCategorySchema,
    effects: z.record(z.string(), z.number()).optional(),
    isRecurring: z.boolean().default(false),
    price: z.number().finite().min(0).default(0),
    costPerTurn: z.number().finite().min(0).default(0),
    assetType: AssetTypeSchema.optional(),
    maintenanceCost: z.number().finite().min(0).optional(),
  })
  .transform((data) => {
    // If it has costPerTurn > 0, it's definitely recurring
    if (data.costPerTurn > 0) {
      data.isRecurring = true
    }
    // If it's recurring, price is usually 0
    if (data.isRecurring && data.price > 0 && data.costPerTurn === 0) {
      // Some items might have price instead of costPerTurn in JSON
      data.costPerTurn = data.price
      data.price = 0
    }
    return data
  })
