import { CheckCircle, UserPlus } from 'lucide-react'
import React from 'react'

import { useInflatedPrice } from '@/core/hooks'
import { getRoleConfig } from '@/core/lib/business'
import type { EmployeeCandidate } from '@/core/types'
import { EmployeeCard } from '@/shared/components/business/employee-card'
import { ROLE_LABELS, ROLE_ICONS } from '@/shared/constants/business'
import { TRAITS_MAP, getTraitIcon, getTraitColor } from '@/shared/lib/business/trait-utils'

interface CandidateCardProps {
  actionIcon?: React.ReactNode
  actionLabel?: string
  actionVariant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost'
  canAfford?: boolean
  candidate: EmployeeCandidate
  className?: string
  isMe?: boolean
  isSelected?: boolean
  onClick?: () => void
}

export function CandidateCard({
  actionIcon,
  actionLabel,
  actionVariant,
  canAfford = true,
  candidate,
  className,
  isMe = false,
  isSelected = false,
  onClick,
}: CandidateCardProps) {
  const salaryObject = React.useMemo(
    () => ({ salary: candidate.requestedSalary }),
    [candidate.requestedSalary],
  )
  const displaySalary = useInflatedPrice(salaryObject)

  const isPlayer = candidate.id.startsWith('player_')

  const mappedTraits = candidate.humanTraits
    .map((traitId) => {
      const trait = TRAITS_MAP[traitId]
      if (!trait) return null
      const TraitIcon = getTraitIcon(trait.type)
      return {
        color: getTraitColor(trait.type),
        description: trait.description,
        icon: <TraitIcon className="w-3 h-3" />,
        name: trait.name,
        type: trait.type,
      }
    })
    .filter((t): t is NonNullable<typeof t> => t !== null) as {
    name: string
    type: string
    icon: React.ReactNode
    color: string
    description: string
  }[]

  const roleCfg = getRoleConfig(candidate.role)
  const isMeAndIncompatible = isMe && candidate.meetsRequirements === false

  return (
    <EmployeeCard
      actionIcon={
        isMeAndIncompatible
          ? null
          : (actionIcon ??
            (isSelected ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <UserPlus className="w-3 h-3 mr-1" />
            )))
      }
      actionLabel={
        isMeAndIncompatible
          ? `Нужен уровень ${String(roleCfg?.minSkillLevel)} ${String(roleCfg?.skillGrowth?.name)}`
          : (actionLabel ?? (isSelected ? 'Выбрано' : 'Выбрать'))
      }
      actionVariant={
        isMeAndIncompatible ? 'ghost' : (actionVariant ?? (isSelected ? 'secondary' : 'default'))
      }
      avatar={candidate.avatar}
      canAfford={canAfford && !isMeAndIncompatible}
      className={`${!canAfford || isMeAndIncompatible ? 'opacity-60' : ''} ${className ?? ''}`}
      experience={candidate.experience}
      id={candidate.id}
      impact={(() => {
        const cfg = getRoleConfig(candidate.role)
        return cfg?.staffImpact ? cfg.staffImpact(candidate.stars) : undefined
      })()}
      isMe={isMe}
      isPlayer={isPlayer}
      isSelected={isSelected}
      name={candidate.name}
      onAction={isMeAndIncompatible ? undefined : onClick}
      role={candidate.role}
      roleIcon={ROLE_ICONS[candidate.role]}
      roleLabel={ROLE_LABELS[candidate.role]}
      salary={displaySalary}
      skills={candidate.skills}
      stars={candidate.stars}
      traits={mappedTraits}
    />
  )
}
