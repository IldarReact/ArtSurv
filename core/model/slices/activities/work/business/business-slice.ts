import type { GameStateCreator, BusinessSlice } from '../../../types'

export const createBusinessSlice: GameStateCreator<BusinessSlice> = (set, get) => ({
  // Delegated to `employees-slice`
  addEmployeeToBusiness: (businessId, employeeName, role, salary, playerId, extraData) => {
    const s = get()
    if (typeof s.addEmployeeToBusiness === 'function') {
      s.addEmployeeToBusiness(businessId, employeeName, role, salary, playerId, extraData)
    }
  },

  addPartnerToBusiness: (businessId, partnerId, partnerName, share, investment) => {
    const s = get()
    if (typeof s.addPartnerToBusiness === 'function') {
      s.addPartnerToBusiness(businessId, partnerId, partnerName, share, investment)
    }
  },

  // Delegated to `shared-business-slice`
  addSharedBusiness: (business) => {
    const s = get()
    if (typeof s.addSharedBusiness === 'function') {
      s.addSharedBusiness(business)
    }
  },

  assignPlayerRole: (businessId, role) => {
    const s = get()
    if (typeof s.assignPlayerRole === 'function') {
      s.assignPlayerRole(businessId, role)
    }
  },

  // Delegated to `pricing-production-slice`
  changePrice: (businessId, newPrice) => {
    const s = get()
    if (typeof s.changePrice === 'function') {
      s.changePrice(businessId, newPrice)
    }
  },

  closeBusiness: (businessId) => {
    const s = get()
    if (typeof s.closeBusiness === 'function') {
      s.closeBusiness(businessId)
    }
  },

  depositToBusinessWallet: (businessId, amount) => {
    const s = get()
    if (typeof s.depositToBusinessWallet === 'function') {
      s.depositToBusinessWallet(businessId, amount)
    }
  },

  // Delegated to `employees-slice`
  fireEmployee: (businessId, employeeId) => {
    const s = get()
    if (typeof s.fireEmployee === 'function') {
      s.fireEmployee(businessId, employeeId)
    }
  },

  freezeBusiness: (businessId) => {
    const s = get()
    if (typeof s.freezeBusiness === 'function') {
      s.freezeBusiness(businessId)
    }
  },

  // Delegated to `employees-slice`
  hireEmployee: (businessId, candidate) => {
    const s = get()
    if (typeof s.hireEmployee === 'function') {
      s.hireEmployee(businessId, candidate)
    }
  },

  hireFamilyMember: (_businessId, _familyMemberId, _role) => {
    // Not implemented yet
    void _businessId
    void _familyMemberId
    void _role
  },

  // Delegated to `employees-slice`
  joinBusinessAsEmployee: (businessId, role, salary) => {
    const s = get()
    if (typeof s.joinBusinessAsEmployee === 'function') {
      s.joinBusinessAsEmployee(businessId, role, salary)
    }
  },

  // Delegated to `employees-slice`
  leaveBusinessJob: (businessId) => {
    const s = get()
    if (typeof s.leaveBusinessJob === 'function') {
      s.leaveBusinessJob(businessId)
    }
  },

  openBranch: (sourceBusinessId) => {
    const s = get()
    if (typeof s.openBranch === 'function') {
      s.openBranch(sourceBusinessId)
    }
  },

  openBusiness: (business, upfrontCost) => {
    const s = get()
    if (typeof s.openBusiness === 'function') {
      s.openBusiness(business, upfrontCost)
    }
  },

  proposeAction: (businessId, type, payload) => {
    const s = get()
    if (typeof s.proposeAction === 'function') {
      s.proposeAction(businessId, type, payload)
    }
  },

  // Delegated to `pricing-production-slice`
  setAutoPurchase: (businessId, amount) => {
    const s = get()
    if (typeof s.setAutoPurchase === 'function') {
      s.setAutoPurchase(businessId, amount)
    }
  },

  setEmployeeEffort: (businessId, employeeId, effortPercent) => {
    const s = get()
    if (typeof s.setEmployeeEffort === 'function') {
      s.setEmployeeEffort(businessId, employeeId, effortPercent)
    }
  },

  // Delegated to `employees-slice`
  setPlayerEmploymentEffort: (businessId, effortPercent) => {
    const s = get()
    if (typeof s.setPlayerEmploymentEffort === 'function') {
      s.setPlayerEmploymentEffort(businessId, effortPercent)
    }
  },

  setPlayerEmploymentSalary: (businessId, salary) => {
    const s = get()
    if (typeof s.setPlayerEmploymentSalary === 'function') {
      s.setPlayerEmploymentSalary(businessId, salary)
    }
  },

  // Delegated to `roles-slice`
  setPlayerManagerialRoles: (businessId, roles) => {
    const s = get()
    if (typeof s.setPlayerManagerialRoles === 'function') {
      s.setPlayerManagerialRoles(businessId, roles)
    }
  },

  // Delegated to `roles-slice`
  setPlayerOperationalRole: (businessId, role) => {
    const s = get()
    if (typeof s.setPlayerOperationalRole === 'function') {
      s.setPlayerOperationalRole(businessId, role)
    }
  },

  // ✅ Multiplayer Actions implementation

  // Delegated to `pricing-production-slice`
  setQuantity: (businessId, newQuantity) => {
    const s = get()
    if (typeof s.setQuantity === 'function') {
      s.setQuantity(businessId, newQuantity)
    }
  },

  unassignPlayerRole: (businessId, role) => {
    const s = get()
    if (typeof s.unassignPlayerRole === 'function') {
      s.unassignPlayerRole(businessId, role)
    }
  },

  unfreezeBusiness: (businessId) => {
    const s = get()
    if (typeof s.unfreezeBusiness === 'function') {
      s.unfreezeBusiness(businessId)
    }
  },

  // Delegated to `employees-slice`
  updateEmployeeInBusiness: (businessId, employeeId, updates) => {
    const s = get()
    if (typeof s.updateEmployeeInBusiness === 'function') {
      s.updateEmployeeInBusiness(businessId, employeeId, updates)
    }
  },
})
