const HIGH_PRODUCTIVITY_THRESHOLD = 80
const LOW_PRODUCTIVITY_THRESHOLD = 50
const KPI_BONUS_PERCENT = 0.1
const KPI_PENALTY_PERCENT = 0.1

/**
 * Рассчитывает KPI бонус/штраф для сотрудника
 */
export function calculateEmployeeKPI(employee: { salary: number; productivity: number }): number {
  if (employee.productivity >= HIGH_PRODUCTIVITY_THRESHOLD)
    return Math.round(employee.salary * KPI_BONUS_PERCENT) // +10%
  if (employee.productivity <= LOW_PRODUCTIVITY_THRESHOLD)
    return -Math.round(employee.salary * KPI_PENALTY_PERCENT) // -10%
  return 0
}
