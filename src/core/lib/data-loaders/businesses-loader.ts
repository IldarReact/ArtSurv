import { BusinessTemplateSchema } from '@/core/schemas/business.schema'
import type { EmployeeRole } from '@/core/types'
// Country imports
import brBusinesses from '@/shared/data/world/countries/brazil/businesses.json'
import geBusinesses from '@/shared/data/world/countries/germany/businesses.json'
import usBusinesses from '@/shared/data/world/countries/us/businesses.json'

export interface BusinessTemplate {
  description?: string
  employeeRoles: {
    role: EmployeeRole
    priority: 'required' | 'recommended' | 'optional'
    description: string
  }[]
  energyCost?: number
  id: string
  imageUrl?: string
  initialCost: number
  inventory?: {
    maxStock: number
    pricePerUnit: number
    purchaseCost: number
    autoPurchaseAmount: number
  }
  isServiceBased: boolean // Является ли бизнес услуговым
  maxEmployees: number
  minEmployees: number
  monthlyExpenses: number
  monthlyIncome: number
  name: string
  openingQuarters: number // Сколько кварталов нужно для открытия
  price: number // Цена товара/услуги (1-10)
  quantity: number // Количество производимого товара за квартал
  risk: 'low' | 'medium' | 'high'
  stressImpact?: number
  type: 'retail' | 'service' | 'manufacturing' | 'tech' | 'cafe' | 'food'
  upfrontCost: number // Полная стоимость (бывший взнос)
  upfrontPaymentPercentage?: number // Опционально
}

function loadBusinessTypes(data: unknown[], source: string): BusinessTemplate[] {
  return data.map((item) => {
    const result = BusinessTemplateSchema.safeParse(item)
    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error(
        `Invalid business type in ${source}:`,
        (item as { id?: string }).id ?? 'unknown',
        result.error.format(),
      )
      throw new Error(
        `Business type data validation failed for ${source}. Check console for details.`,
      )
    }
    return result.data as BusinessTemplate
  })
}

// Country Data Registry
const COUNTRY_BUSINESSES: Record<string, BusinessTemplate[]> = {
  brazil: loadBusinessTypes(brBusinesses, 'brazil/businesses.json'),
  germany: loadBusinessTypes(geBusinesses, 'germany/businesses.json'),
  us: loadBusinessTypes(usBusinesses, 'us/businesses.json'),
}

// Get business types for specific country
function getCountryBusinessTypes(countryId: string): BusinessTemplate[] {
  return COUNTRY_BUSINESSES[countryId] ?? []
}

// Export for backward compatibility (defaults to US)
export const ALL_BUSINESS_TYPES = COUNTRY_BUSINESSES.us

export function getBusinessTypeById(id: string, countryId = 'us'): BusinessTemplate | undefined {
  const businesses = getCountryBusinessTypes(countryId)
  return businesses.find((b) => b.id === id)
}

export function getBusinessTypesByCategory(type: string, countryId = 'us'): BusinessTemplate[] {
  const businesses = getCountryBusinessTypes(countryId)
  return businesses.filter((b) => b.type === type)
}

export function getAllBusinessTypesForCountry(countryId: string): BusinessTemplate[] {
  return getCountryBusinessTypes(countryId)
}
