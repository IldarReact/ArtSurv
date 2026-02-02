'use client'

import { Users, Activity } from 'lucide-react'
import React from 'react'

import { calculateBusinessFinancials } from '@/core/lib/business'
import type {
  EmployeeRole,
  Business,
  Employee,
  BusinessPosition,
  Player,
  Country,
} from '@/core/types'
import type { Skill } from '@/core/types/skill.types'

import { HireActionsSection } from './employee-management/hire-actions-section'
import { NpcEmployeesSection } from './employee-management/npc-employees-section'
import { PlayerRolesSection } from './employee-management/player-roles-section'
import { VacanciesSection } from './employee-management/vacancies-section'

interface EmployeeManagementProps {
  activePlayerRoles: EmployeeRole[]
  availableBudget: number
  availablePositions: BusinessPosition[]
  business: Business
  calculateEmployeeSalary: (employee: Employee, country: Country) => number
  canHireMore: boolean
  country: Country
  handleDemoteEmployee: (id: string, name: string, salary: number, stars: number) => void
  handleFireEmployee: (id: string, name: string) => void
  handlePromoteEmployee: (
    id: string,
    name: string,
    salary: number,
    stars: number,
    experience: number,
  ) => void
  handleUnassignRole: (role: EmployeeRole) => void
  openHireDialog: (role: EmployeeRole) => void
  player: Player
  playerSkills: Skill[]
  setEmployeeEffort: (businessId: string, employeeId: string, value: number) => void
  setPlayerEmploymentEffort: (businessId: string, value: number) => void
  setPlayerEmploymentSalary: (businessId: string, value: number) => void
  staffingCheck: {
    isValid: boolean
    missingRoles: EmployeeRole[]
    totalEmployees: number
    requiredEmployees: number
    workerCount: number
    requiredWorkers: number
  }
}

export function EmployeeManagement({
  activePlayerRoles,
  availableBudget,
  availablePositions,
  business,
  calculateEmployeeSalary,
  canHireMore,
  country,
  handleDemoteEmployee,
  handleFireEmployee,
  handlePromoteEmployee,
  handleUnassignRole,
  openHireDialog,
  player,
  playerSkills,
  setEmployeeEffort,
  setPlayerEmploymentEffort,
  setPlayerEmploymentSalary,
  staffingCheck,
}: EmployeeManagementProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Персонал и участие</h3>
        </div>
        <div className="text-right">
          {canHireMore && (
            <p className="text-sm text-white/60">
              Бюджет:{' '}
              <span className="text-green-400 font-bold">${availableBudget.toLocaleString()}</span>
            </p>
          )}
          {(() => {
            const effects = calculateBusinessFinancials(business, true).playerStatEffects
            const energy = effects.energy ?? 0
            const sanity = effects.sanity ?? 0
            const hasEffects = energy !== 0 || sanity !== 0

            return hasEffects ? (
              <div className="flex gap-4 mt-1">
                {energy !== 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Activity className="w-3 h-3 text-blue-400" />
                    <span className="text-red-400 font-bold">{energy} Энерг.</span>
                  </div>
                )}
                {sanity !== 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Activity className="w-3 h-3 text-purple-400" />
                    <span className="text-red-400 font-bold">{sanity} Рассуд.</span>
                  </div>
                )}
              </div>
            ) : null
          })()}
        </div>
      </div>

      <div className="space-y-8">
        <PlayerRolesSection
          activePlayerRoles={activePlayerRoles}
          business={business}
          handleUnassignRole={handleUnassignRole}
          player={player}
          playerSkills={playerSkills}
          setPlayerEmploymentEffort={setPlayerEmploymentEffort}
          setPlayerEmploymentSalary={setPlayerEmploymentSalary}
        />

        <NpcEmployeesSection
          business={business}
          calculateEmployeeSalary={calculateEmployeeSalary}
          country={country}
          handleDemoteEmployee={handleDemoteEmployee}
          handleFireEmployee={handleFireEmployee}
          handlePromoteEmployee={handlePromoteEmployee}
          player={player}
          setEmployeeEffort={setEmployeeEffort}
        />

        <VacanciesSection
          availablePositions={availablePositions}
          missingRoles={staffingCheck.missingRoles}
          openHireDialog={openHireDialog}
        />

        {activePlayerRoles.length === 0 &&
          business.employees.length === 0 &&
          staffingCheck.missingRoles.length === 0 && (
            <div className="text-center py-12 mb-6 bg-white/5 rounded-xl border border-dashed border-white/10">
              <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <p className="text-white/50 text-lg">Нет сотрудников</p>
              <p className="text-white/30 text-sm">Наймите персонал для развития бизнеса</p>
            </div>
          )}
      </div>

      <HireActionsSection
        business={business}
        canHireMore={canHireMore}
        openHireDialog={openHireDialog}
      />
    </div>
  )
}
