import { canMakeDirectChanges } from '@/core/lib/business/partnership-permissions'
import { useGameStore } from '@/core/model/store'
import type { Business, EmployeeCandidate, EmployeeRole } from '@/core/types'
import type { EmployeeStars } from '@/core/types/business.types'

import { ROLE_LABELS } from '../../constants'
import { useBusinessActionExecutor } from './action-executor'

const PROPOSAL_SENT_TITLE = 'Предложение отправлено'

export function useEmployeeActions(business: Business | undefined) {
  const { pushNotification, updateEmployeeInBusiness } = useGameStore()
  const { executeAction, player } = useBusinessActionExecutor(business)

  const handleHire = (
    candidate: EmployeeCandidate,
    onJoinAsEmployee: (
      businessId: string,
      role: EmployeeRole,
      salary: number,
      productivity: number,
      effortPercent: number,
    ) => void,
    onHireEmployee: (businessId: string, candidate: EmployeeCandidate) => void,
    setHireDialogOpen: (isOpen: boolean) => void,
  ) => {
    if (!business) return
    const isMe =
      candidate.id.startsWith('player_') ||
      candidate.id === `player_${player?.id ?? 'local'}` ||
      candidate.id === player?.id

    const isManagerial = ['manager', 'accountant', 'marketer', 'lawyer', 'hr'].includes(
      candidate.role,
    )

    executeAction({
      directAction: () => {
        if (isMe) {
          onJoinAsEmployee(
            business.id,
            candidate.role,
            candidate.requestedSalary,
            100,
            isManagerial ? 50 : 100,
          )
        } else {
          onHireEmployee(business.id, candidate)
        }
      },
      errorMessage:
        'У вас недостаточно доли в бизнесе для управления персоналом (требуется минимум 50%)',
      notificationMessage: isMe
        ? `Предложение о вашем вступлении в роль ${ROLE_LABELS[candidate.role]} отправлено партнёру`
        : `Предложение о найме ${candidate.name} отправлено партнёру`,
      notificationTitle: PROPOSAL_SENT_TITLE,
      proposalData: {
        employeeId: isMe ? player?.id : undefined,
        employeeName: candidate.name,
        employeeRole: candidate.role,
        employeeSalary: candidate.requestedSalary,
        employeeStars: candidate.stars,
        experience: candidate.experience,
        humanTraits: candidate.humanTraits,
        isMe: isMe,
        skills: candidate.skills,
      },
      proposalType: isMe ? 'change_role' : 'hire_employee',
    })

    if (!business.partners.length || canMakeDirectChanges(business, player?.id ?? '')) {
      setHireDialogOpen(false)
    }
  }

  const handleFireEmployee = (
    employeeId: string,
    employeeName: string,
    onFireEmployee: (businessId: string, employeeId: string) => void,
  ) => {
    if (!business) return
    executeAction({
      directAction: () => {
        onFireEmployee(business.id, employeeId)
      },
      errorMessage:
        'У вас недостаточно доли в бизнесе для увольнения сотрудников (требуется минимум 50%)',
      notificationMessage: `Предложение об увольнении ${employeeName} отправлено партнёру`,
      notificationTitle: PROPOSAL_SENT_TITLE,
      proposalData: {
        fireEmployeeId: employeeId,
        fireEmployeeName: employeeName,
      },
      proposalType: 'fire_employee',
    })
  }

  const handlePromoteEmployee = (
    employeeId: string,
    employeeName: string,
    currentSalary: number,
    currentStars: number,
    experience: number,
    onPromoteEmployee?: (
      businessId: string,
      employeeId: string,
      newSalary: number,
      newStars: EmployeeStars,
    ) => void,
  ) => {
    if (!business) return
    const newSalary = Math.round(currentSalary * 1.15)
    let newStars = currentStars
    if (currentStars < 5 && experience >= 4) {
      newStars = currentStars + 1
    }

    executeAction({
      directAction: () => {
        if (onPromoteEmployee) {
          onPromoteEmployee(business.id, employeeId, newSalary, newStars as EmployeeStars)
        } else {
          updateEmployeeInBusiness(business.id, employeeId, {
            salary: newSalary,
            stars: newStars as EmployeeStars,
          })
        }
        pushNotification({
          message: `${employeeName} повышен до ${String(newStars)} звёзд!`,
          title: 'Повышение',
          type: 'success',
        })
      },
      errorMessage:
        'У вас недостаточно доли в бизнесе для повышения сотрудников (требуется минимум 50%)',
      notificationMessage: `Предложение о повышении ${employeeName} отправлено партнёру`,
      notificationTitle: PROPOSAL_SENT_TITLE,
      proposalData: {
        newSalary,
        newStars: newStars as EmployeeStars,
        promoteEmployeeId: employeeId,
        promoteEmployeeName: employeeName,
      },
      proposalType: 'promote_employee',
    })
  }

  const handleDemoteEmployee = (
    employeeId: string,
    employeeName: string,
    currentSalary: number,
    currentStars: number,
    onDemoteEmployee?: (
      businessId: string,
      employeeId: string,
      newSalary: number,
      newStars: EmployeeStars,
    ) => void,
  ) => {
    if (!business) return
    const newSalary = Math.round(currentSalary * 0.85)
    const newStars = Math.max(1, currentStars - 1)

    executeAction({
      directAction: () => {
        if (onDemoteEmployee) {
          onDemoteEmployee(business.id, employeeId, newSalary, newStars as EmployeeStars)
        } else {
          updateEmployeeInBusiness(business.id, employeeId, {
            salary: newSalary,
            stars: newStars as EmployeeStars,
          })
        }
        pushNotification({
          message: `${employeeName} понижен до ${String(newStars)} звёзд.`,
          title: 'Понижение',
          type: 'info',
        })
      },
      errorMessage:
        'У вас недостаточно доли в бизнесе для понижения сотрудников (требуется минимум 50%)',
      notificationMessage: `Предложение о понижении ${employeeName} отправлено партнёру`,
      notificationTitle: PROPOSAL_SENT_TITLE,
      proposalData: {
        demoteEmployeeId: employeeId,
        demoteEmployeeName: employeeName,
        newSalary,
        newStars: newStars as EmployeeStars,
      },
      proposalType: 'demote_employee',
    })
  }

  const handleSetSalary = (
    employeeId: string,
    employeeName: string,
    newSalary: number,
    onSetSalary: (businessId: string, employeeId: string, salary: number) => void,
  ) => {
    if (!business) return
    executeAction({
      directAction: () => {
        onSetSalary(business.id, employeeId, newSalary)
      },
      errorMessage:
        'У вас недостаточно доли в бизнесе для изменения зарплат (требуется минимум 50%)',
      notificationMessage: `Предложение об изменении зарплаты ${employeeName} отправлено партнёру`,
      notificationTitle: PROPOSAL_SENT_TITLE,
      proposalData: {
        newSalary,
        salaryEmployeeId: employeeId,
        salaryEmployeeName: employeeName,
      },
      proposalType: 'set_salary',
    })
  }

  const handleUpdateEmployee = (
    employeeId: string,
    data: Partial<{
      salary: number
      stars: EmployeeStars
      effortPercent: number
    }>,
  ) => {
    if (!business) return
    updateEmployeeInBusiness(business.id, employeeId, data)
  }

  const handleUnassignRole = (
    role: EmployeeRole,
    onUnassignRole: (businessId: string, role: EmployeeRole) => void,
  ) => {
    if (!business) return
    executeAction({
      directAction: () => {
        onUnassignRole(business.id, role)
      },
      errorMessage: 'У вас недостаточно доли в бизнесе для изменения состава персонала',
      notificationMessage: `Предложение о вашем уходе из роли ${ROLE_LABELS[role]} отправлено партнёру`,
      notificationTitle: PROPOSAL_SENT_TITLE,
      proposalData: {
        fireEmployeeId: `player_${String(player?.id)}`,
        fireEmployeeName: player?.name ?? '',
        isMe: true,
      },
      proposalType: 'fire_employee',
    })
  }

  return {
    handleDemoteEmployee,
    handleFireEmployee,
    handleHire,
    handlePromoteEmployee,
    handleSetSalary,
    handleUnassignRole,
    handleUpdateEmployee,
  }
}
