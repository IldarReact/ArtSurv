'use client'

import React from 'react'

import { getRoleConfig } from '@/core/lib/business/employee-roles.config'
import { useGameStore } from '@/core/model/store'
import type { SkillLevel, StatEffect } from '@/core/types'
import { ROLE_LABELS } from '@/shared/constants/business'

export function useWorkActivity() {
  const store = useGameStore()
  const { applyForFreelance, applyForJob, askForRaise, completeFreelanceGig, player } = store

  const [feedback, setFeedback] = React.useState<{
    show: boolean
    success: boolean
    message: string
  }>({
    message: '',
    show: false,
    success: false,
  })

  const handleApply = (
    title: string,
    company: string,
    salary: number,
    cost: StatEffect,
    requirements: { skill: string; level: number }[],
  ) => {
    if (!player) return
    const energyCost = Math.abs(cost.energy ?? 0)
    if (player.stats.energy < energyCost) {
      setFeedback({
        message: 'Недостаточно энергии для собеседования',
        show: true,
        success: false,
      })
      return
    }

    const reqs = requirements.map((r) => ({
      minLevel: r.level as SkillLevel,
      skillId: r.skill,
    }))

    applyForJob(title, company, salary, cost, reqs)
    setFeedback({ message: `Заявка на "${title}" отправлена!`, show: true, success: true })
  }

  const handleFreelanceApply = (
    gigId: string,
    title: string,
    payment: number,
    energyCost: number,
    requirements: { skill: string; level: SkillLevel }[],
    duration: number,
  ) => {
    if (!player) return
    if (player.stats.energy < energyCost) {
      setFeedback({
        message: 'Недостаточно энергии для выполнения заказа',
        show: true,
        success: false,
      })
      return
    }

    const reqs = requirements.map((r) => ({
      minLevel: r.level,
      skillId: r.skill,
    }))

    applyForFreelance(gigId, title, payment, { energy: -energyCost }, reqs, duration)
    setFeedback({ message: `Заявка на заказ "${title}" отправлена!`, show: true, success: true })
  }

  const handleAskForRaise = (jobId: string) => {
    askForRaise(jobId)
  }

  const handleCompleteGig = (gigId: string) => {
    completeFreelanceGig(gigId)
  }

  const allJobs = React.useMemo(() => {
    if (!player) return []

    // Фильтруем обычные работы, исключая устаревшие записи бизнес-ролей
    const regularJobs = player.jobs.filter((j) => !j.id.startsWith('job_business_'))

    const businessJobs = player.businesses.flatMap((b) => {
      const roles = [
        ...b.playerRoles.managerialRoles,
        ...(b.playerRoles.operationalRole ? [b.playerRoles.operationalRole] : []),
      ]

      return roles.map((role) => {
        const roleCfg = getRoleConfig(role)
        const isEmployed = b.playerEmployment?.role === role
        const salary = isEmployed ? Math.round((b.playerEmployment?.salary ?? 0) / 3) : 0
        const effortPercent = isEmployed ? (b.playerEmployment?.effortPercent ?? 100) : 100

        const costs = roleCfg?.playerEffects
          ? {
              energy: Math.abs(
                Math.round((roleCfg.playerEffects.energy ?? 0) * (effortPercent / 100)),
              ),
              sanity: Math.abs(
                Math.round((roleCfg.playerEffects.sanity ?? 0) * (effortPercent / 100)),
              ),
            }
          : { energy: 10, sanity: 2 }

        return {
          businessId: b.id,
          company: b.name,
          cost: costs,
          description: roleCfg?.description ?? '',
          effortPercent,
          id: `business-job-${b.id}-${role}`,
          imageUrl: b.imageUrl ?? '',
          isBusinessRole: true,
          role: role,
          salary: salary,
          skills: {
            efficiency: 100,
            ...Object.fromEntries(player.personal.skills.map((s) => [s.id, s.level])),
          },
          stars:
            player.personal.skills.length > 0
              ? Math.max(1, ...player.personal.skills.map((s) => s.level))
              : 1,
          title: ROLE_LABELS[role],
        }
      })
    })

    return [...regularJobs, ...businessJobs]
  }, [player])

  return {
    ...store,
    allJobs,
    feedback,
    handleApply,
    handleAskForRaise,
    handleCompleteGig,
    handleFreelanceApply,
    setFeedback,
  }
}
