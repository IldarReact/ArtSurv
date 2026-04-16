import { useMemo } from 'react'

import { calculateEstimatedMonthlyProfit } from '@/core/lib/business/business-financials'
import { getRoleConfig } from '@/core/lib/business/employee-roles.config'
import { getAllBusinessTypesForCountry } from '@/core/lib/data-loaders/businesses-loader'
import { useGameStore } from '@/core/model/store'
import type { CountryEconomy } from '@/core/types'

import { getRoleIcon, getBusinessTypeLabel, formatCurrency } from '../../utils/business-ui-mappers'
import type { BusinessOption, BusinessRequirement } from '../types'

export function useBusinessOptions(): BusinessOption[] {
  const player = useGameStore((state) => state.player)
  const countries = useGameStore((state) => state.countries)
  const countryId = player?.countryId ?? 'us'
  const economy = countries[countryId] as CountryEconomy | undefined

  return useMemo(() => {
    if (!economy) return []
    const templates = getAllBusinessTypesForCountry(countryId)
    return templates.map((template) => {
      const corporateTaxRate = economy.corporateTaxRate
      const estProfit = calculateEstimatedMonthlyProfit(
        template.monthlyIncome,
        template.monthlyExpenses,
        corporateTaxRate,
      )

      // Range for income display (approx +/- 30% of est profit)
      const minIncome = Math.round(estProfit * 0.7)
      const maxIncome = Math.round(estProfit * 1.3)

      const requirements: BusinessRequirement[] = template.employeeRoles.map((role) => {
        const roleConfig = getRoleConfig(role.role)
        return {
          description: role.description || (roleConfig?.description ?? ''),
          icon: getRoleIcon(role.role, role.priority),
          priority: role.priority,
          role: roleConfig?.name ?? role.role,
        }
      })

      return {
        businessType: template.type,
        cost: template.initialCost,
        description: template.description ?? '',
        energyCost: template.energyCost ?? 15,
        expenses: `${formatCurrency(template.monthlyExpenses)}/мес`,
        id: template.id,
        image:
          template.imageUrl ??
          'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=600&fit=crop',
        income: `${formatCurrency(minIncome)} - ${formatCurrency(maxIncome)}/мес`,
        maxEmployees: template.maxEmployees,
        monthlyExpenses: template.monthlyExpenses,
        monthlyIncome: template.monthlyIncome,
        requirements: requirements,
        stressImpact: template.stressImpact ?? 2,
        title: template.name,
        type: getBusinessTypeLabel(template.initialCost),
      }
    })
  }, [countryId, economy])
}
