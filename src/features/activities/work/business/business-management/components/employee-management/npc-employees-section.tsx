'use client'

import { Users, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import React from 'react'

import { getRoleConfig } from '@/core/lib/business'
import type { Business, Employee, Player, Country } from '@/core/types'
import { EmployeeCard } from '@/shared/components/business/employee-card'

import { ROLE_ICONS, ROLE_LABELS } from '../../constants'

interface NpcEmployeesSectionProps {
  business: Business
  calculateEmployeeSalary: (employee: Employee, country: Country) => number
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
  player: Player
  setEmployeeEffort: (businessId: string, employeeId: string, value: number) => void
}

function PlayerEmployeeItem({
  calculateEmployeeSalary,
  country,
  employee,
}: {
  calculateEmployeeSalary: (employee: Employee, country: Country) => number
  country: Country
  employee: Employee
}) {
  const cfg = getRoleConfig(employee.role)
  const indexedSalary = calculateEmployeeSalary(employee, country)
  return (
    <EmployeeCard
      experience={employee.experience}
      id={employee.id}
      impact={cfg?.staffImpact ? cfg.staffImpact(employee.stars) : undefined}
      isMe={true}
      isPlayer={true}
      key={employee.id}
      name={employee.name}
      productivity={employee.productivity}
      role={employee.role}
      roleIcon={ROLE_ICONS[employee.role]}
      roleLabel={ROLE_LABELS[employee.role]}
      salary={indexedSalary}
      salaryLabel="/кв"
      stars={employee.stars}
    />
  )
}

function NpcEmployeeItem({
  businessId,
  calculateEmployeeSalary,
  country,
  employee,
  handleDemoteEmployee,
  handleFireEmployee,
  handlePromoteEmployee,
  setEmployeeEffort,
}: {
  businessId: string
  calculateEmployeeSalary: (employee: Employee, country: Country) => number
  country: Country
  employee: Employee
  handleDemoteEmployee: (id: string, name: string, salary: number, stars: number) => void
  handleFireEmployee: (id: string, name: string) => void
  handlePromoteEmployee: (
    id: string,
    name: string,
    salary: number,
    stars: number,
    experience: number,
  ) => void
  setEmployeeEffort: (businessId: string, employeeId: string, value: number) => void
}) {
  const isNpcPlayer = employee.id.startsWith('player_')
  const cfg = getRoleConfig(employee.role)
  const indexedSalary = calculateEmployeeSalary(employee, country)

  return (
    <EmployeeCard
      actionIcon={<Trash2 className="w-3 h-3 mr-1" />}
      actionLabel="Уволить"
      actionVariant="destructive"
      effortPercent={isNpcPlayer ? employee.effortPercent : undefined}
      experience={employee.experience}
      id={employee.id}
      impact={cfg?.staffImpact ? cfg.staffImpact(employee.stars) : undefined}
      isMe={false}
      isPlayer={isNpcPlayer}
      key={employee.id}
      name={employee.name}
      onAction={() => {
        handleFireEmployee(employee.id, employee.name)
      }}
      onEffortChange={
        isNpcPlayer
          ? (value: number) => {
              setEmployeeEffort(businessId, employee.id, value)
            }
          : undefined
      }
      onSecondaryAction={() => {
        handlePromoteEmployee(
          employee.id,
          employee.name,
          employee.salary,
          employee.stars,
          employee.experience,
        )
      }}
      onTertiaryAction={() => {
        handleDemoteEmployee(employee.id, employee.name, employee.salary, employee.stars)
      }}
      productivity={employee.productivity}
      role={employee.role}
      roleIcon={ROLE_ICONS[employee.role]}
      roleLabel={ROLE_LABELS[employee.role]}
      salary={indexedSalary}
      salaryLabel="/кв"
      secondaryActionIcon={<ArrowUpCircle className="w-3 h-3 mr-1" />}
      secondaryActionLabel="Повысить"
      stars={employee.stars}
      tertiaryActionIcon={<ArrowDownCircle className="w-3 h-3 mr-1" />}
      tertiaryActionLabel="Понизить"
    />
  )
}

export function NpcEmployeesSection({
  business,
  calculateEmployeeSalary,
  country,
  handleDemoteEmployee,
  handleFireEmployee,
  handlePromoteEmployee,
  player,
  setEmployeeEffort,
}: NpcEmployeesSectionProps) {
  if (business.employees.length === 0) return null

  const playerEmployee = business.employees.find((e) => e.id === `player_${player.id}`)
  const otherEmployees = business.employees.filter((e) => e.id !== `player_${player.id}`)

  return (
    <div>
      <h4 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <Users className="w-4 h-4" />
        Нанятый персонал
      </h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {playerEmployee && (
          <PlayerEmployeeItem
            calculateEmployeeSalary={calculateEmployeeSalary}
            country={country}
            employee={playerEmployee}
          />
        )}
        {otherEmployees.map((employee) => (
          <NpcEmployeeItem
            businessId={business.id}
            calculateEmployeeSalary={calculateEmployeeSalary}
            country={country}
            employee={employee}
            handleDemoteEmployee={handleDemoteEmployee}
            handleFireEmployee={handleFireEmployee}
            handlePromoteEmployee={handlePromoteEmployee}
            key={employee.id}
            setEmployeeEffort={setEmployeeEffort}
          />
        ))}
      </div>
    </div>
  )
}
