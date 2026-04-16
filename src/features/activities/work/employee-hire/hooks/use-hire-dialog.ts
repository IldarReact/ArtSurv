import { useMemo, useState } from 'react'

import { generateCandidates } from '@/core/lib/business/employee-generator'
import { getInflatedBaseSalary } from '@/core/lib/calculations/price-helpers'
import { getOnlinePlayers } from '@/core/lib/multiplayer'
import { useGameStore } from '@/core/model/store'
import type { EmployeeCandidate } from '@/core/types'

import { KPI_CONFIG, SALARY_CONFIG } from '../../shared-constants'
import { createPlayerCandidate } from '../utils/employee-utils'

export function useHireDialog(isOpen: boolean, initialCandidates: EmployeeCandidate[]) {
  const countries = useGameStore((state) => state.countries)
  const player = useGameStore((state) => state.player)
  const country = player ? countries[player.countryId] : undefined

  // Применяем инфляцию к минимальной зарплате
  const inflatedMinSalary = useMemo(
    () => (country ? getInflatedBaseSalary(SALARY_CONFIG.MIN, country) : SALARY_CONFIG.MIN),
    [country],
  )

  const inflatedDefaultSalary = useMemo(
    () => (country ? getInflatedBaseSalary(SALARY_CONFIG.DEFAULT, country) : SALARY_CONFIG.DEFAULT),
    [country],
  )

  const npcCandidates = useMemo(() => {
    if (!isOpen) return []
    // Если кандидаты не переданы извне, генерируем их здесь
    if (initialCandidates.length === 0 && player) {
      // Берем дефолтную роль, если список пуст (обычно это не должно случаться)
      const role = 'worker'
      return generateCandidates(role, 5, country, player.countryId)
    }
    return initialCandidates
  }, [isOpen, initialCandidates, player, country])

  const [selectedCandidate, setSelectedCandidate] = useState<EmployeeCandidate | null>(null)
  const [activeTab, setActiveTab] = useState<'npc' | 'players'>('npc')
  const onlinePlayers = useMemo(() => {
    if (isOpen && activeTab === 'players') {
      return getOnlinePlayers()
    }
    return []
  }, [isOpen, activeTab])

  const [customSalary, setCustomSalary] = useState<number>(inflatedDefaultSalary)
  const [customKPI, setCustomKPI] = useState<number>(KPI_CONFIG.DEFAULT)

  // Сброс состояния при открытии диалога
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setSelectedCandidate(null)
      setCustomSalary(inflatedDefaultSalary)
    }
  }

  // useEffect теперь не нужен для синхронного сброса

  const displayCandidates = useMemo(() => {
    if (activeTab === 'npc') return npcCandidates

    // Создаем список кандидатов-игроков
    const playerCandidates = onlinePlayers.map((p) =>
      createPlayerCandidate(
        p,
        npcCandidates[0]?.role ?? 'worker',
        customSalary,
        p.isLocal ? (player ?? undefined) : undefined,
      ),
    )

    // Проверяем, есть ли локальный игрок в списке. Если нет (например, оффлайн) - добавляем его принудительно
    const hasLocalPlayer = onlinePlayers.some((p) => p.isLocal)

    if (!hasLocalPlayer && player) {
      const playerClientId = player.id
      playerCandidates.unshift(
        createPlayerCandidate(
          { clientId: playerClientId, isLocal: true, name: player.name },
          npcCandidates[0]?.role ?? 'worker',
          customSalary,
          player,
        ),
      )
    }

    return playerCandidates
  }, [activeTab, npcCandidates, onlinePlayers, player, customSalary])

  return {
    activeTab,
    customKPI,
    customSalary,
    displayCandidates,
    inflatedMinSalary,
    selectedCandidate,
    setActiveTab,
    setCustomKPI,
    setCustomSalary,
    setSelectedCandidate,
  }
}
