import type { Business, EmployeeRole, EmployeeCandidate } from '@/core/types'

export interface BusinessManagementDialogProps {
  businessId: string | null
  onOpenChange: (open: boolean) => void
  open: boolean
}

export interface BusinessManagementProps {
  business: Business
  onChangePrice: (businessId: string, newPrice: number) => void
  onFireEmployee: (businessId: string, employeeId: string) => void
  onHireEmployee: (businessId: string, candidate: EmployeeCandidate) => void
  onJoinAsEmployee: (businessId: string, role: EmployeeRole, salary: number) => void
  onLeaveJob: (businessId: string) => void
  onOpenBranch: (sourceBusinessId: string) => void
  onSetQuantity: (businessId: string, newQuantity: number) => void
  onUnassignRole: (businessId: string, role: EmployeeRole) => void
  playerCash: number
  proposalsCount?: number
}

export interface AvailablePosition {
  description: string
  role: EmployeeRole
  salary: number
}
