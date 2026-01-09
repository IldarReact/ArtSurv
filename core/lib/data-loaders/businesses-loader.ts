import { BusinessTemplateSchema } from '@/core/schemas/business.schema'
// Country imports
import brBusinesses from '@/shared/data/world/countries/brazil/businesses.json'
import geBusinesses from '@/shared/data/world/countries/germany/businesses.json'
import usBusinesses from '@/shared/data/world/countries/us/businesses.json'

export interface BusinessTemplate {
  id: string
  name: string
  description?: string
  imageUrl?: string
  type: 'retail' | 'service' | 'manufacturing' | 'tech' | 'cafe' | 'food'
  price: number // Цена товара/услуги (1-10)
  quantity: number // Количество производимого товара за квартал
  isServiceBased: boolean // Является ли бизнес услуговым
  initialCost: number
  upfrontCost: number // Полная стоимость (бывший взнос)
  upfrontPaymentPercentage?: number // Опционально
  openingQuarters: number // Сколько кварталов нужно для открытия
  monthlyIncome: number
  monthlyExpenses: number
  maxEmployees: number
  minEmployees: number
  inventory?: {
    maxStock: number
    pricePerUnit: number
    purchaseCost: number
    autoPurchaseAmount: number
  }
  employeeRoles: Array<{
    role: import('@/core/types').EmployeeRole
    priority: 'required' | 'recommended' | 'optional'
    description: string
  }>
  risk: 'low' | 'medium' | 'high'
  energyCost?: number
  stressImpact?: number
}

function loadBusinessTypes(data: unknown[], source: string): BusinessTemplate[] {
  return data
    .map((item) => {
      const result = BusinessTemplateSchema.safeParse(item)
      if (!result.success) {
        console.error(`Invalid business type in ${source}:`, item, result.error.format())
        throw new Error(`Business type data validation failed for ${source}`)
      }
      return result.data as BusinessTemplate
    })
    .filter((item): item is BusinessTemplate => item !== null)
}

// Country Data Registry
const COUNTRY_BUSINESSES: Record<string, BusinessTemplate[]> = {
  us: loadBusinessTypes(usBusinesses, 'us/businesses.json'),
  germany: loadBusinessTypes(geBusinesses, 'germany/businesses.json'),
  brazil: loadBusinessTypes(brBusinesses, 'brazil/businesses.json'),
}

// Get business types for specific country
function getCountryBusinessTypes(countryId: string): BusinessTemplate[] {
  if (!COUNTRY_BUSINESSES[countryId]) {
    console.error(`No business types data found for country: ${countryId}`)
    return []
  }
  return COUNTRY_BUSINESSES[countryId]
}

// Export for backward compatibility (defaults to US)
export const ALL_BUSINESS_TYPES = COUNTRY_BUSINESSES.us || []

export function getBusinessTypeById(
  id: string,
  countryId: string = 'us',
): BusinessTemplate | undefined {
  const businesses = getCountryBusinessTypes(countryId)
  return businesses.find((b) => b.id === id)
}

export function getBusinessTypesByCategory(
  type: string,
  countryId: string = 'us',
): BusinessTemplate[] {
  const businesses = getCountryBusinessTypes(countryId)
  return businesses.filter((b) => b.type === type)
}

export function getAllBusinessTypesForCountry(countryId: string): BusinessTemplate[] {
  return getCountryBusinessTypes(countryId)
}
