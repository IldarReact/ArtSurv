import type { StateCreator } from 'zustand'

import { calculateMemberExpenses } from '@/core/lib/lifestyle-expenses'

import type { GameStore, FamilySlice } from '../../types'
import { processGoalCompletion } from './utils/goal-logic'
import { createNewMember } from './utils/member-factory'
import {
  processStartDating,
  processAcceptPartner,
  processTryForBaby,
  processAdoptPet,
} from './utils/relationship-logic'

export const createFamilySlice: StateCreator<GameStore, [], [], FamilySlice> = (set, get) => ({
  // ------------------------------------------------------------
  // ACCEPT PARTNER
  // ------------------------------------------------------------
  acceptPartner: () => {
    const { countries, player } = get()
    if (!player) return

    const result = processAcceptPartner(player, countries, calculateMemberExpenses)
    if (!result) return

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        familyMembers: [...prev.personal.familyMembers, result.newMember],
        isDating: false,
        potentialPartner: null,
      },
    }))

    get().pushNotification({
      message: `Вы начали отношения с ${result.partnerName}.`,
      title: 'Новые отношения!',
      type: 'success',
    })
  },

  // ------------------------------------------------------------
  // ADD FAMILY MEMBER
  // ------------------------------------------------------------
  addFamilyMember: (name, type, age, income, expenses) => {
    const newMember = createNewMember(name, type, age, income, expenses)

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        familyMembers: [...prev.personal.familyMembers, newMember],
      },
    }))

    get().pushNotification({
      message: `В вашей семье появился новый член: ${name}`,
      title: 'Пополнение в семье!',
      type: 'success',
    })
  },

  // ------------------------------------------------------------
  // ADOPT PET
  // ------------------------------------------------------------
  adoptPet: (petType, name, cost) => {
    const { countries, player } = get()
    if (!player) return

    const result = processAdoptPet(player, countries, cost, name)
    if (!result) return

    if (!get().performTransaction({ money: -result.cost }, { title: 'Завести питомца' })) {
      return
    }

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        familyMembers: [...prev.personal.familyMembers, result.newPet],
      },
    }))

    get().pushNotification({
      message: `У вас появился питомец: ${name}`,
      title: 'Новый друг!',
      type: 'success',
    })
  },

  // ------------------------------------------------------------
  // COMPLETE LIFE GOAL
  // ------------------------------------------------------------
  completeLifeGoal: (goalId) => {
    const { player } = get()
    if (!player) return

    const result = processGoalCompletion(player, goalId)
    if (!result) return

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        lifeGoals: result.personal.lifeGoals,
      },
    }))

    get().applyStatChanges({ happiness: 10, sanity: 10 })

    get().pushNotification({
      message: `Вы достигли цели «${result.goalTitle}»`,
      title: 'Цель достигнута! 🎉',
      type: 'success',
    })
  },

  // ------------------------------------------------------------
  // REJECT PARTNER
  // ------------------------------------------------------------
  rejectPartner: () => {
    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        potentialPartner: null,
      },
    }))
  },

  // ------------------------------------------------------------
  // REMOVE FAMILY MEMBER
  // ------------------------------------------------------------
  removeFamilyMember: (id) => {
    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        familyMembers: prev.personal.familyMembers.filter((m) => m.id !== id),
      },
    }))
  },

  // ------------------------------------------------------------
  // SET MEMBER FOOD PREFERENCE
  // ------------------------------------------------------------
  setMemberFoodPreference: (memberId, foodId) => {
    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        familyMembers: prev.personal.familyMembers.map((m) =>
          m.id === memberId ? { ...m, foodPreference: foodId } : m,
        ),
      },
    }))
  },

  // ------------------------------------------------------------
  // SET MEMBER TRANSPORT PREFERENCE
  // ------------------------------------------------------------
  setMemberTransportPreference: (memberId, transportId) => {
    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        familyMembers: prev.personal.familyMembers.map((m) =>
          m.id === memberId ? { ...m, transportPreference: transportId } : m,
        ),
      },
    }))
  },

  // ------------------------------------------------------------
  // START DATING
  // ------------------------------------------------------------
  startDating: () => {
    const { countries, player } = get()
    if (!player) return

    const result = processStartDating(player, countries)
    if (!result) return

    if (
      !get().performTransaction(
        { energy: -result.energy, money: -result.money },
        { title: 'Поиск партнера' },
      )
    ) {
      return
    }

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        isDating: true,
      },
    }))

    get().pushNotification({
      message: 'Вы начали искать партнера.',
      title: 'Поиск партнера',
      type: 'info',
    })
  },

  // ------------------------------------------------------------
  // TRY FOR BABY
  // ------------------------------------------------------------
  tryForBaby: () => {
    const { player } = get()
    if (!player) return

    const result = processTryForBaby(player)
    if (!result) return

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        pregnancy: result.pregnancy,
      },
    }))

    get().pushNotification({
      message: 'Вы решили завести ребенка.',
      title: 'Планирование ребенка',
      type: 'success',
    })
  },

  // ------------------------------------------------------------
  // UPDATE LIFE GOAL
  // ------------------------------------------------------------
  updateLifeGoal: (goalId, progress) => {
    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        lifeGoals: prev.personal.lifeGoals.map((g) => (g.id === goalId ? { ...g, progress } : g)),
      },
    }))
  },
})
