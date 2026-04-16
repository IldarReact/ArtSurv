import type { Business } from '@/core/types'

import { useEmployeeActions } from './use-business-actions/use-employee-actions'
import { useOperationalActions } from './use-business-actions/use-operational-actions'

export function useBusinessActions(business: Business | undefined) {
  const employeeActions = useEmployeeActions(business)
  const operationalActions = useOperationalActions(business)

  return {
    ...employeeActions,
    ...operationalActions,
  }
}
