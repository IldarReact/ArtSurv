import React from 'react'

import { getInflatedEducationPrice } from '@/core/lib/calculations/price-helpers'
import { getAllCoursesForCountry } from '@/core/lib/data-loaders/courses-loader'
import { useGameStore } from '@/core/model/store'

export function useEducation() {
  const { applyToUniversity, countries, player, studyCourse } = useGameStore()
  const [feedback, setFeedback] = React.useState<{
    show: boolean
    success: boolean
    message: string
  }>({
    message: '',
    show: false,
    success: false,
  })

  const currentCountry = React.useMemo(
    () => (player ? countries[player.countryId] : null),
    [player, countries],
  )
  const countryId = player?.countryId ?? 'us'
  const availableCourses = React.useMemo(() => getAllCoursesForCountry(countryId), [countryId])

  const getInflatedCoursePrice = React.useCallback(
    (basePrice: number): number => {
      if (!currentCountry) return basePrice
      return getInflatedEducationPrice(basePrice, currentCountry)
    },
    [currentCountry],
  )

  const skills = React.useMemo(
    () => (player?.personal.skills ?? []).filter((s) => s.level > 0),
    [player?.personal.skills],
  )
  const activeCourses = React.useMemo(() => player?.personal.activeCourses ?? [], [player])
  const activeUniversity = React.useMemo(() => player?.personal.activeUniversity ?? [], [player])
  const hasSkills = skills.length > 0
  const hasActiveEducation = activeCourses.length > 0 || activeUniversity.length > 0

  const parseDuration = React.useCallback((duration: string): number => {
    if (duration.includes('год')) {
      const years = parseInt(duration)
      return years * 4
    }
    if (duration.includes('месяц')) {
      const months = parseInt(duration)
      return Math.ceil(months / 3)
    }
    if (duration.includes('недел')) {
      return 1
    }
    return 1
  }, [])

  const calculateCurrentEnergyCost = React.useCallback(() => {
    if (!player) return 0
    let total = 0
    for (const c of activeCourses) {
      total += c.costPerTurn?.energy ?? 0
    }
    for (const c of activeUniversity) {
      total += c.costPerTurn?.energy ?? 0
    }
    for (const j of player.jobs) {
      total += j.cost.energy ?? 0
    }
    return total
  }, [activeCourses, activeUniversity, player])

  const handleCourseEnroll = React.useCallback(
    (
      courseName: string,
      baseCost: number,
      energyCost: number,
      skillBonus: string,
      durationStr: string,
    ) => {
      if (!player) return
      const duration = parseDuration(durationStr)
      const inflatedCost = getInflatedCoursePrice(baseCost)
      const currentEnergyCost = calculateCurrentEnergyCost()

      if (100 - currentEnergyCost < energyCost) {
        setFeedback({
          message: 'Недостаточно свободной энергии. Завершите другие дела.',
          show: true,
          success: false,
        })
        return
      }

      if (player.stats.money < inflatedCost) {
        setFeedback({ message: 'Недостаточно денег для оплаты курса', show: true, success: false })
        return
      }

      studyCourse(courseName, inflatedCost, { energy: energyCost }, skillBonus, duration)
      setFeedback({ message: `Вы записались на курс "${courseName}"`, show: true, success: true })
    },
    [player, parseDuration, getInflatedCoursePrice, calculateCurrentEnergyCost, studyCourse],
  )

  if (!player) {
    return {
      feedback,
      player: null,
      setFeedback,
    }
  }

  const handleUniversityApply = (
    programName: string,
    baseCost: number,
    energyCost: number,
    skillBonus: string,
    durationStr: string,
  ) => {
    const duration = parseDuration(durationStr)
    const inflatedCost = getInflatedCoursePrice(baseCost)
    const currentEnergyCost = calculateCurrentEnergyCost()

    if (100 - currentEnergyCost < energyCost) {
      setFeedback({
        message: 'Недостаточно свободной энергии. Завершите другие дела.',
        show: true,
        success: false,
      })
      return
    }

    if (player.stats.money < inflatedCost) {
      setFeedback({ message: 'Недостаточно денег для оплаты обучения', show: true, success: false })
      return
    }

    applyToUniversity(programName, inflatedCost, { energy: energyCost }, skillBonus, duration)
    setFeedback({ message: `Документы на "${programName}" поданы`, show: true, success: true })
  }

  return {
    activeCourses,
    activeUniversity,
    availableCourses,
    currentCountry,
    feedback,
    getInflatedCoursePrice,
    handleCourseEnroll,
    handleUniversityApply,
    hasActiveEducation,
    hasSkills,
    player,
    setFeedback,
    skills,
  }
}
