import type { Business } from '../../../types/business.types'
import type { CountryEconomy } from '../../../types/economy.types'
import { getQuarterlyInflatedSalary } from '../../calculations/price-helpers'
import { BUSINESS_BALANCE } from '../../data-loaders/business-balance-loader'
import { calculateEmployeeKPI } from '../employee-calculations'

const PERCENT_DIVISOR = 100
const DEFAULT_EFFORT = 100
const DEFAULT_PRODUCTIVITY = 100
const PLAYER_STAFF_COUNT = 1
const REDUCTION_BASE = 1

export interface OpExResult {
  minFixedCosts: number
  reducedEmployeesCost: number
  reducedInsurance: number
  reducedRent: number
  reducedUtilities: number
  totalOpEx: number
}

interface EmployeeLike {
  effortPercent?: number
  experience?: number
  productivity?: number
  salary: number
}

function calculateStaffMemberCost(
  member: EmployeeLike,
  economy: CountryEconomy | undefined,
): number {
  const salary = member.salary
  if (Number.isNaN(salary)) return 0

  const experience = member.experience ?? 0

  const indexedSalary = economy ? getQuarterlyInflatedSalary(salary, economy, experience) : salary

  const effort = member.effortPercent ?? DEFAULT_EFFORT
  const effortFactor = effort / PERCENT_DIVISOR
  const scaledSalary = indexedSalary * effortFactor

  const prod = member.productivity ?? DEFAULT_PRODUCTIVITY
  const kpi = calculateEmployeeKPI({
    ...member,
    productivity: prod,
    salary: scaledSalary,
  })

  return scaledSalary + kpi
}

export function calculateOpEx(
  business: Business,
  economy: CountryEconomy | undefined,
  expenseReductionPct: number,
): OpExResult {
  const { staffing } = BUSINESS_BALANCE

  // 1. Employee Costs
  let baseEmployeesCost = 0
  for (const emp of business.employees) {
    baseEmployeesCost += calculateStaffMemberCost(emp, economy)
  }

  // Add player salary
  if (business.playerEmployment) {
    baseEmployeesCost += calculateStaffMemberCost(business.playerEmployment, economy)
  }

  const payrollTaxes = baseEmployeesCost * (staffing.payrollTaxRate / PERCENT_DIVISOR)
  const employeesCost = baseEmployeesCost + payrollTaxes

  // 2. Fixed Costs
  const actualStaffCount =
    business.employees.length + (business.playerEmployment ? PLAYER_STAFF_COUNT : 0)
  const CAPACITY_WEIGHT = 0.2
  const STAFFING_WEIGHT = 0.8
  const capacityFactor = business.maxEmployees * CAPACITY_WEIGHT
  const staffingFactor = actualStaffCount * STAFFING_WEIGHT
  const effectiveScalingCount = capacityFactor + staffingFactor

  const rent = staffing.baseRentPerEmployee * effectiveScalingCount
  const utilities = staffing.baseUtilitiesPerEmployee * effectiveScalingCount
  const insurance = business.hasInsurance ? business.insuranceCost : 0
  const MIN_FIXED_COSTS = staffing.minFixedCosts

  // 3. Reductions
  const reductionFactor =
    expenseReductionPct > 0
      ? Math.max(0, REDUCTION_BASE - expenseReductionPct / PERCENT_DIVISOR)
      : 1

  const reducedEmployeesCost = Math.round(employeesCost * reductionFactor)
  const reducedRent = Math.round(rent * reductionFactor)
  const reducedUtilities = Math.round(utilities * reductionFactor)
  const reducedInsurance = Math.round(insurance * reductionFactor)
  const reducedMinFixedCosts = Math.round(MIN_FIXED_COSTS * reductionFactor)

  const totalOpEx =
    reducedEmployeesCost + reducedRent + reducedUtilities + reducedInsurance + reducedMinFixedCosts

  return {
    minFixedCosts: reducedMinFixedCosts,
    reducedEmployeesCost,
    reducedInsurance,
    reducedRent,
    reducedUtilities,
    totalOpEx,
  }
}
