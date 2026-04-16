import type { GameStateCreator } from '../../../types'
import type { BusinessSlice } from '../../../types/business.types'
import {
  handleJoinBusinessAsEmployee,
  handleLeaveBusinessJob,
  handleSetPlayerEmploymentEffort,
  handleSetPlayerEmploymentSalary,
  handleUpdateEmployeeInBusiness,
} from './employees/employment-logic'
import {
  handleHireEmployee,
  handleFireEmployee,
  handleAddEmployeeToBusiness,
  handleHireFamilyMember,
} from './employees/hire-logic'

export const createEmployeesSlice: GameStateCreator<Partial<BusinessSlice>> = (set, get) => ({
  addEmployeeToBusiness: (businessId, employeeName, role, salary, playerId, extraData) => {
    handleAddEmployeeToBusiness(
      get(),
      set,
      businessId,
      employeeName,
      role,
      salary,
      playerId,
      extraData,
    )
  },

  fireEmployee: (businessId, employeeId) => {
    handleFireEmployee(get(), set, businessId, employeeId)
  },

  hireEmployee: (businessId, candidate) => {
    handleHireEmployee(get(), set, businessId, candidate)
  },

  hireFamilyMember: (businessId, familyMemberId, role) => {
    handleHireFamilyMember(get(), set, businessId, familyMemberId, role)
  },

  joinBusinessAsEmployee: (businessId, role, salary, productivity, effortPercent) => {
    handleJoinBusinessAsEmployee(get(), set, businessId, role, salary, productivity, effortPercent)
  },

  leaveBusinessJob: (businessId) => {
    handleLeaveBusinessJob(get(), set, businessId)
  },

  setPlayerEmploymentEffort: (businessId, effortPercent) => {
    handleSetPlayerEmploymentEffort(get(), set, businessId, effortPercent)
  },

  setPlayerEmploymentSalary: (businessId, salary) => {
    handleSetPlayerEmploymentSalary(get(), set, businessId, salary)
  },

  updateEmployeeInBusiness: (businessId, employeeId, updates) => {
    handleUpdateEmployeeInBusiness(get(), set, businessId, employeeId, updates)
  },
})
