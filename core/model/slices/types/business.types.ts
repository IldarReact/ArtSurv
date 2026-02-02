import type { Business, EmployeeCandidate, EmployeeRole, Employee } from '@/core/types'
import type { BusinessChangeType } from '@/core/types/business.types'

export interface BusinessSlice {
  addEmployeeToBusiness: (
    businessId: string,
    employeeName: string,
    role: EmployeeRole,
    salary: number,
    playerId?: string,
    extraData?: Partial<Employee>,
  ) => void
  // ✅ Multiplayer Business Actions
  addPartnerToBusiness: (
    businessId: string,
    partnerId: string,
    partnerName: string,
    share: number,
    investment: number,
  ) => void
  addSharedBusiness: (business: Business) => void
  assignPlayerRole: (businessId: string, role: EmployeeRole) => void

  changePrice: (businessId: string, newPrice: number) => void
  closeBusiness: (businessId: string) => void
  depositToBusinessWallet: (businessId: string, amount: number) => void
  fireEmployee: (businessId: string, employeeId: string) => void
  freezeBusiness: (businessId: string) => void
  hireEmployee: (businessId: string, candidate: EmployeeCandidate) => void
  hireFamilyMember: (businessId: string, familyMemberId: string, role: EmployeeRole) => void
  // ✅ Player Employment in Business
  joinBusinessAsEmployee: (
    businessId: string,
    role: EmployeeRole,
    salary: number,
    productivity?: number,
    effortPercent?: number,
  ) => void
  leaveBusinessJob: (businessId: string) => void
  openBranch: (sourceBusinessId: string) => void
  // Actions
  openBusiness: (business: Business, upfrontCost: number) => void
  proposeAction: (
    businessId: string,
    changeType: BusinessChangeType,
    data: { newPrice?: number; newQuantity?: number; amount?: number },
  ) => void
  setAutoPurchase: (businessId: string, amount: number) => void

  setEmployeeEffort: (businessId: string, employeeId: string, effortPercent: number) => void
  setPlayerEmploymentEffort: (businessId: string, effortPercent: number) => void
  setPlayerEmploymentSalary: (businessId: string, salary: number) => void
  // New actions
  setPlayerManagerialRoles: (businessId: string, roles: EmployeeRole[]) => void
  setPlayerOperationalRole: (businessId: string, role: EmployeeRole | null) => void

  setQuantity: (businessId: string, newQuantity: number) => void
  unassignPlayerRole: (businessId: string, role: EmployeeRole) => void
  unfreezeBusiness: (businessId: string) => void
  updateEmployeeInBusiness: (
    businessId: string,
    employeeId: string,
    updates: Partial<Employee>,
  ) => void
}

export interface PricingProductionSlice {
  changePrice: (businessId: string, newPrice: number) => void
  setAutoPurchase: (businessId: string, amount: number) => void
}

export interface SharedBusinessSlice {
  addSharedBusiness: (business: Business) => void
}
