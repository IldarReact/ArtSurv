'use client'

import React from 'react'

import type { StaffImpactResult, PlayerBusinessImpact, EmployeeSkills } from '@/core/types'
import { Card } from '@/shared/components/card'
import { cn } from '@/shared/utils/utils'

import { EmployeeCardContent } from './employee-card/employee-card-content'
import { EmployeeCardFooter } from './employee-card/employee-card-footer'
import { EmployeeCardHeader } from './employee-card/employee-card-header'

interface EmployeeCardProps {
  actionIcon?: React.ReactNode
  actionLabel?: string
  actionVariant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost'
  avatar?: string
  canAfford?: boolean
  className?: string
  company?: string
  cost?: {
    energy?: number
    sanity?: number
    health?: number
    happiness?: number
    intelligence?: number
  }
  costs?: {
    energy?: number
    sanity?: number
    health?: number
    happiness?: number
    intelligence?: number
  }
  effortPercent?: number
  experience?: number
  id: string
  impact?:
    | StaffImpactResult
    | PlayerBusinessImpact
    | {
        efficiency?: number
        revenue?: number
        quality?: number
        description?: string
      }
  isApplied?: boolean
  isMe?: boolean
  isPartialAllowed?: boolean
  isPlayer?: boolean
  isSelected?: boolean
  isVacancy?: boolean
  name: string
  onAction?: () => void
  onEffortChange?: (value: number) => void
  onSalaryChange?: (value: number) => void
  onSecondaryAction?: () => void
  onTertiaryAction?: () => void
  productivity?: number
  requirements?: { skill: string; level: number }[]
  role: string
  roleIcon?: React.ReactNode
  roleLabel?: string
  salary?: number
  salaryLabel?: string
  secondaryActionIcon?: React.ReactNode
  secondaryActionLabel?: string
  skillGrowth?: {
    name: string
    progress: number
    progressPerQuarter: number
  }
  skills?: Record<string, number> | EmployeeSkills
  stars?: number
  tertiaryActionIcon?: React.ReactNode
  tertiaryActionLabel?: string
  traits?: {
    name: string
    type: string
    icon: React.ReactNode
    color: string
    description: string
  }[]
}

export function EmployeeCard({
  actionIcon,
  actionLabel,
  actionVariant = 'default',
  avatar,
  canAfford = true,
  className,
  company,
  cost,
  costs,
  effortPercent,
  experience: _experience,
  id: _id,
  impact,
  isMe = false,
  isPartialAllowed = false,
  isSelected = false,
  isVacancy = false,
  name,
  onAction,
  onEffortChange,
  onSecondaryAction,
  onTertiaryAction,
  productivity,
  requirements,
  role,
  roleIcon,
  roleLabel,
  salary,
  salaryLabel = '/мес',
  secondaryActionIcon,
  secondaryActionLabel,
  skillGrowth,
  stars = 0,
  tertiaryActionIcon,
  tertiaryActionLabel,
  traits,
}: EmployeeCardProps) {
  void _experience
  void _id
  const finalCosts = costs ?? cost

  // Normalize impact for display
  const displayImpact = React.useMemo(() => {
    if (!impact) return null

    // Case 1: Simple object (backward compatibility or specific use cases)
    if ('efficiency' in impact || 'revenue' in impact || 'description' in impact) {
      const simpleImpact = impact as {
        efficiency?: number
        revenue?: number
        description?: string
      }
      return {
        description: simpleImpact.description,
        efficiency: simpleImpact.efficiency,
        revenue: simpleImpact.revenue,
      }
    }

    // Case 2: StaffImpactResult or PlayerBusinessImpact
    const staffImpact = impact as StaffImpactResult
    const playerImpact = impact as PlayerBusinessImpact

    const eff = staffImpact.efficiencyMultiplier ?? playerImpact.efficiencyBase
    const rev = staffImpact.salesBonus ?? playerImpact.salesBonus

    return {
      description: undefined,
      efficiency: eff,
      revenue: rev,
    }
  }, [impact])

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-500 group cursor-pointer',
        'bg-zinc-900/90 border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10',
        'flex flex-col h-full py-0 gap-0 backdrop-blur-sm',
        isSelected &&
          'border-blue-500/50 bg-blue-500/5 shadow-2xl shadow-blue-500/20 ring-1 ring-blue-500/30',
        className,
      )}
      onClick={onAction}
    >
      <EmployeeCardHeader
        avatar={avatar}
        company={company}
        isMe={isMe}
        isVacancy={isVacancy}
        name={name}
        role={role}
        roleIcon={roleIcon}
        roleLabel={roleLabel}
        salary={salary}
        salaryLabel={salaryLabel}
        stars={stars}
      />

      <EmployeeCardContent
        displayImpact={displayImpact}
        effortPercent={effortPercent}
        finalCosts={finalCosts}
        isPartialAllowed={isPartialAllowed}
        isVacancy={isVacancy}
        onEffortChange={onEffortChange}
        productivity={productivity}
        requirements={requirements}
        skillGrowth={skillGrowth}
        traits={traits}
      />

      <EmployeeCardFooter
        actionIcon={actionIcon}
        actionLabel={actionLabel}
        actionVariant={actionVariant}
        canAfford={canAfford}
        isSelected={isSelected}
        onAction={onAction}
        onSecondaryAction={onSecondaryAction}
        onTertiaryAction={onTertiaryAction}
        secondaryActionIcon={secondaryActionIcon}
        secondaryActionLabel={secondaryActionLabel}
        tertiaryActionIcon={tertiaryActionIcon}
        tertiaryActionLabel={tertiaryActionLabel}
      />
    </Card>
  )
}
