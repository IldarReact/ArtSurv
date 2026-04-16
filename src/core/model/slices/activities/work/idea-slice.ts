import type { StateCreator } from 'zustand'

import { createBusinessPurchase } from '@/core/lib/business/purchase-logic'
import {
  generateBusinessIdea,
  calculateDevelopmentCost,
  canDevelopIdea,
} from '@/core/lib/idea-generator'

import type { GameStore, IdeaSlice } from '../../types'

const ENERGY_COST_GENERATE_IDEA = 20
const PROGRESS_MAX = 100

const REPUTATION_BASE = 50
const DEMAND_WEIGHT = 0.3
const RISK_LOW_BONUS = 5
const RISK_HIGH_PENALTY = -5
const RISK_VERY_HIGH_PENALTY = -10
const RANDOM_OFFSET = 0.5
const RISK_VERY_HIGH_RANDOM_SCALE = 40
const RISK_DEFAULT_RANDOM_SCALE = 20

const EFFICIENCY_BASE = 50
const POTENTIAL_RETURN_WEIGHT = 10

const UNPROFITABLE_BUSINESS_INCOME = 0
const UNPROFITABLE_BUSINESS_EXPENSES = 0
const DEFAULT_UPFRONT_PAYMENT_PERCENTAGE = 0
const MAX_EMPLOYEES_DEFAULT = 25
const MIN_EMPLOYEES_DEFAULT = 1
const CREATION_COST_ENERGY_DEFAULT = 0
const CREATION_COST_MONEY_DEFAULT = 0

export const createIdeaSlice: StateCreator<GameStore, [], [], IdeaSlice> = (set, get) => ({
  developIdea: (ideaId: string, investment: number) => {
    const state = get()
    if (!state.player) return

    const ideaIndex = state.player.businessIdeas.findIndex((i) => i.id === ideaId)
    if (ideaIndex === -1) return

    const idea = state.player.businessIdeas[ideaIndex]

    // Проверка денег
    if (state.player.stats.money < investment) {
      return
    }

    // Проверка требований навыков
    if (!canDevelopIdea(idea, state.player.personal.skills)) {
      return
    }

    // Списываем деньги через транзакцию
    if (!state.performTransaction({ money: -investment }, { title: 'Развитие идеи' })) {
      return
    }

    // Обновляем идею
    const updatedIdea = { ...idea }
    updatedIdea.investedAmount += investment

    // Прогресс развития
    const costForNextStage = calculateDevelopmentCost(idea)
    const progressGain = (investment / costForNextStage) * PROGRESS_MAX

    updatedIdea.developmentProgress += progressGain

    // Переход на следующую стадию
    if (updatedIdea.developmentProgress >= PROGRESS_MAX) {
      updatedIdea.developmentProgress = 0
      if (updatedIdea.stage === 'idea') updatedIdea.stage = 'prototype'
      else if (updatedIdea.stage === 'prototype') updatedIdea.stage = 'mvp'
      else if (updatedIdea.stage === 'mvp') updatedIdea.stage = 'launched'
    }

    const updatedIdeas = [...state.player.businessIdeas]
    updatedIdeas[ideaIndex] = updatedIdea

    state.updatePlayer((_prev) => ({
      businessIdeas: updatedIdeas,
    }))
  },

  discardIdea: (ideaId: string) => {
    const state = get()
    if (!state.player) return

    const updatedIdeas = state.player.businessIdeas.filter((i) => i.id !== ideaId)

    state.updatePlayer((_prev) => ({
      businessIdeas: updatedIdeas,
    }))
  },

  generateIdea: () => {
    const state = get()
    if (!state.player) return

    // Списываем энергию через транзакцию
    if (
      !state.performTransaction({ energy: -ENERGY_COST_GENERATE_IDEA }, { title: 'Генерация идеи' })
    ) {
      return
    }

    // Генерируем идею
    const idea = generateBusinessIdea(
      state.player.personal.skills,
      state.turn,
      state.globalMarket.value,
    )

    state.updatePlayer((prev) => ({
      businessIdeas: [...prev.businessIdeas, idea],
    }))
  },

  launchBusinessFromIdea: (ideaId: string) => {
    const state = get()
    if (!state.player) return

    const ideaIndex = state.player.businessIdeas.findIndex((i) => i.id === ideaId)
    if (ideaIndex === -1) return

    const idea = state.player.businessIdeas[ideaIndex]

    if (idea.stage !== 'launched' && idea.stage !== 'mvp') {
      return
    }

    // Удаляем идею из списка
    const updatedIdeas = state.player.businessIdeas.filter((i) => i.id !== ideaId)

    const { business } = createBusinessPurchase(
      {
        description: idea.description,
        employeeRoles: [
          { description: 'Manager', priority: 'required', role: 'manager' },
          { description: 'Accountant', priority: 'required', role: 'accountant' },
        ],
        id: `biz_${String(Date.now())}`,
        initialCost: idea.investedAmount,
        maxEmployees: MAX_EMPLOYEES_DEFAULT,
        minEmployees: MIN_EMPLOYEES_DEFAULT,
        monthlyExpenses: UNPROFITABLE_BUSINESS_EXPENSES,
        monthlyIncome: UNPROFITABLE_BUSINESS_INCOME,
        name: idea.name,
        type: idea.type,
        upfrontPaymentPercentage: DEFAULT_UPFRONT_PAYMENT_PERCENTAGE, // Already paid via investment
      },
      idea.investedAmount,
      state.turn,
    )

    // Override specific idea-based metrics
    business.reputation = Math.max(
      0,
      Math.min(
        100,
        REPUTATION_BASE +
          idea.marketDemand * DEMAND_WEIGHT +
          (idea.riskLevel === 'low'
            ? RISK_LOW_BONUS
            : idea.riskLevel === 'high'
              ? RISK_HIGH_PENALTY
              : idea.riskLevel === 'very_high'
                ? RISK_VERY_HIGH_PENALTY
                : 0) +
          (Math.random() - RANDOM_OFFSET) *
            (idea.riskLevel === 'very_high'
              ? RISK_VERY_HIGH_RANDOM_SCALE
              : RISK_DEFAULT_RANDOM_SCALE),
      ),
    )
    business.efficiency = Math.max(
      0,
      Math.min(100, EFFICIENCY_BASE + idea.potentialReturn * POTENTIAL_RETURN_WEIGHT),
    )
    business.state = 'active' // Ideas are usually active immediately when launched
    if (business.openingProgress) {
      business.openingProgress.remainingDuration = 0 // Already developed
    }
    business.creationCost = {
      energy: CREATION_COST_ENERGY_DEFAULT,
      money: CREATION_COST_MONEY_DEFAULT,
    } // Already paid

    state.updatePlayer((prev) => ({
      businesses: [...prev.businesses, business],
      businessIdeas: updatedIdeas,
    }))
  },
})
