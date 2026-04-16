'use client'

import { UserPlus, Trash2 } from 'lucide-react'
import React from 'react'

import { getRoleConfig, isManagerialRole } from '@/core/lib/business'
import type { EmployeeRoleConfig } from '@/core/lib/business/employee-roles.config'
import { getSingleRoleImpact } from '@/core/lib/business/player-roles'
import type { EmployeeRole, Business, Player } from '@/core/types'
import type { EmployeeStars } from '@/core/types/business.types'
import type { Skill } from '@/core/types/skill.types'
import { EmployeeCard } from '@/shared/components/business/employee-card'

import { ROLE_ICONS, ROLE_LABELS } from '../../constants'

interface PlayerRolesSectionProps {
  activePlayerRoles: EmployeeRole[]
  business: Business
  handleUnassignRole: (role: EmployeeRole) => void
  player: Player
  playerSkills: Skill[]
  setPlayerEmploymentEffort: (businessId: string, value: number) => void
  setPlayerEmploymentSalary: (businessId: string, value: number) => void
}

function getPlayerSkillInfo(
  playerSkills: Skill[],
  roleCfg: EmployeeRoleConfig | null | undefined,
  effortPercent: number,
  role: EmployeeRole,
) {
  const skillName = roleCfg?.skillGrowth?.name
  const playerSkill = skillName ? playerSkills.find((s) => s.name === skillName) : null

  const skillEntries: [string, number][] = playerSkills.map((s) => [s.id, s.level * 20])
  const skills: Record<string, number> = Object.fromEntries([['efficiency', 100], ...skillEntries])

  const skillGrowth =
    playerSkill && roleCfg?.skillGrowth
      ? {
          name: roleCfg.skillGrowth.name,
          progress: playerSkill.progress,
          progressPerQuarter: Math.round(
            roleCfg.skillGrowth.progressPerQuarter *
              (isManagerialRole(role) ? effortPercent / 100 : 1),
          ),
        }
      : undefined

  return { playerSkill, skillGrowth, skills }
}

function PlayerRoleItem({
  business,
  handleUnassignRole,
  player,
  playerSkills,
  role,
  setPlayerEmploymentEffort,
  setPlayerEmploymentSalary,
}: {
  role: EmployeeRole
} & Omit<PlayerRolesSectionProps, 'activePlayerRoles'>) {
  const isEmployed = business.playerEmployment?.role === role
  const roleCfg = getRoleConfig(role)
  const effortPercent = isEmployed ? (business.playerEmployment?.effortPercent ?? 100) : 100

  const { playerSkill, skillGrowth, skills } = getPlayerSkillInfo(
    playerSkills,
    roleCfg,
    effortPercent,
    role,
  )

  const costs = roleCfg?.playerEffects
    ? {
        energy: Math.abs(Math.round((roleCfg.playerEffects.energy ?? 0) * (effortPercent / 100))),
        sanity: Math.abs(Math.round((roleCfg.playerEffects.sanity ?? 0) * (effortPercent / 100))),
      }
    : undefined

  const stars = playerSkill
    ? (Math.max(1, Math.min(5, playerSkill.level)) as EmployeeStars)
    : (3 as EmployeeStars)

  return (
    <EmployeeCard
      actionIcon={<Trash2 className="w-3 h-3 mr-1" />}
      actionLabel="Покинуть роль"
      actionVariant="destructive"
      className="bg-linear-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 shadow-lg"
      costs={costs}
      effortPercent={effortPercent}
      id={`player_${player.id}_${role}`}
      impact={getSingleRoleImpact(role, playerSkills, effortPercent)}
      isMe={true}
      isPartialAllowed={isManagerialRole(role)}
      isPlayer={true}
      key={`player-role-${role}`}
      name={player.name}
      onAction={() => {
        handleUnassignRole(role)
      }}
      onEffortChange={
        isEmployed
          ? (value: number) => {
              setPlayerEmploymentEffort(business.id, value)
            }
          : undefined
      }
      onSalaryChange={
        isEmployed
          ? (value: number) => {
              setPlayerEmploymentSalary(business.id, value * 3)
            }
          : undefined
      }
      role={role}
      roleIcon={ROLE_ICONS[role]}
      roleLabel={ROLE_LABELS[role]}
      salary={isEmployed ? Math.round((business.playerEmployment?.salary ?? 0) / 3) : 0}
      salaryLabel="/мес"
      skillGrowth={skillGrowth}
      skills={skills}
      stars={stars}
    />
  )
}

export function PlayerRolesSection({
  activePlayerRoles,
  business,
  handleUnassignRole,
  player,
  playerSkills,
  setPlayerEmploymentEffort,
  setPlayerEmploymentSalary,
}: PlayerRolesSectionProps) {
  if (activePlayerRoles.length === 0) return null

  return (
    <div>
      <h4 className="text-sm font-semibold text-purple-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <UserPlus className="w-4 h-4" />
        Ваше участие в бизнесе
      </h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activePlayerRoles.map((role) => (
          <PlayerRoleItem
            business={business}
            handleUnassignRole={handleUnassignRole}
            key={`player-role-${role}`}
            player={player}
            playerSkills={playerSkills}
            role={role}
            setPlayerEmploymentEffort={setPlayerEmploymentEffort}
            setPlayerEmploymentSalary={setPlayerEmploymentSalary}
          />
        ))}
      </div>
    </div>
  )
}
