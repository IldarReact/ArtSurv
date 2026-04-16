'use client'

import { Store, UserPlus } from 'lucide-react'
import React from 'react'

import type { EmployeeRole, BusinessPosition } from '@/core/types'
import { EmployeeCard } from '@/shared/components/business/employee-card'

import { ROLE_ICONS, ROLE_LABELS } from '../../constants'

interface VacanciesSectionProps {
  availablePositions: BusinessPosition[]
  missingRoles: EmployeeRole[]
  openHireDialog: (role: EmployeeRole) => void
}

export function VacanciesSection({
  availablePositions,
  missingRoles,
  openHireDialog,
}: VacanciesSectionProps) {
  if (missingRoles.length === 0) return null

  return (
    <div>
      <h4 className="text-sm font-semibold text-amber-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <Store className="w-4 h-4" />
        Необходимые вакансии
      </h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {missingRoles.map((role: EmployeeRole) => (
          <EmployeeCard
            actionIcon={<UserPlus className="w-3 h-3 mr-1" />}
            actionLabel="Нанять / Занять"
            id={`vacancy-${role}`}
            isVacancy={true}
            key={`vacancy-${role}`}
            name="Вакансия"
            onAction={() => {
              openHireDialog(role)
            }}
            role={role}
            roleIcon={ROLE_ICONS[role]}
            roleLabel={ROLE_LABELS[role]}
            salary={availablePositions.find((p) => p.role === role)?.salary ?? 0}
            salaryLabel="/кв"
          />
        ))}
      </div>
    </div>
  )
}
