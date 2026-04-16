import { z } from 'zod'

export const AssetTypeSchema = z.enum(['housing', 'real_estate', 'stock', 'business', 'deposit'])
export const DebtTypeSchema = z.enum(['mortgage', 'consumer_credit', 'student_loan'])

export const AssetSchema = z
  .object({
    currentValue: z.number(),
    expenses: z.number(),
    id: z.string(),
    income: z.number(),
    lastSoldPrice: z.number().optional(),
    liquidity: z.enum(['low', 'medium', 'high']),
    name: z.string(),
    purchasePrice: z.number(),
    quantity: z.number().optional(),
    risk: z.enum(['low', 'medium', 'high']),
    soldAt: z.number().optional(),
    stockSymbol: z.string().optional(),
    type: AssetTypeSchema,
    unrealizedGain: z.number(),
    value: z.number(),
  })
  .strict()

export const DebtSchema = z
  .object({
    id: z.string(),
    interestRate: z.number(),
    name: z.string(),
    principalAmount: z.number(),
    quarterlyInterest: z.number(),
    quarterlyPayment: z.number(),
    quarterlyPrincipal: z.number(),
    remainingAmount: z.number(),
    remainingQuarters: z.number(),
    startTurn: z.number(),
    termQuarters: z.number(),
    type: DebtTypeSchema,
  })
  .strict()

export const IncomeBreakdownSchema = z
  .object({
    assetIncome: z.number(),
    businessRevenue: z.number(),
    capitalGains: z.number(),
    familyIncome: z.number(),
    salary: z.number(),
    total: z.number(),
  })
  .strict()

export const ExpensesBreakdownSchema = z
  .object({
    assetMaintenance: z.number(),
    business: z.number(),
    credits: z.number(),
    debtInterest: z.number(),
    family: z.number(),
    food: z.number(),
    housing: z.number(),
    living: z.number(),
    mortgage: z.number(),
    other: z.number(),
    total: z.number(),
    transport: z.number(),
  })
  .strict()

export const TaxesBreakdownSchema = z
  .object({
    business: z.number(),
    capital: z.number(),
    income: z.number(),
    property: z.number(),
    total: z.number(),
  })
  .strict()

export const QuarterlyReportSchema = z
  .object({
    expenses: ExpensesBreakdownSchema,
    income: IncomeBreakdownSchema,
    netProfit: z.number(),
    taxes: TaxesBreakdownSchema,
    warning: z.string().nullable(),
  })
  .strict()

// --- Shop Types ---

export const ShopCategorySchema = z.enum(['food', 'transport', 'health', 'services', 'housing'])

export const ShopItemSchema = z
  .object({
    assetType: AssetTypeSchema.optional(),
    category: ShopCategorySchema,
    costPerTurn: z.number().finite().min(0).default(0),
    description: z.string().optional(),
    effects: z.record(z.string(), z.number()).optional(),
    id: z.string(),
    isRecurring: z.boolean().default(false),
    maintenanceCost: z.number().finite().min(0).optional(),
    name: z.string(),
    price: z.number().finite().min(0).default(0),
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
