import { WORLD_COUNTRIES } from '@/core/lib/data-loaders/economy-loader'
import {
  calculateEmergencyLoanAmount,
  calculateFamilyHelp,
  FINANCIAL_CRISIS_THRESHOLD,
} from '@/core/lib/financial-crisis'
import { createInitialPlayer } from '@/core/lib/initial-state'
import type { ActivityType } from '@/core/types'

import { processTurn } from '../logic'
import type { GameStateCreator, GameSlice } from './types'

const EMERGENCY_LOAN_RATE = 25
const EMERGENCY_LOAN_QUARTERS = 12
const QUARTERS_IN_YEAR = 4
const PERCENT_DIVISOR = 100
const FAMILY_LOYALTY_DROP = 20

export const createGameSlice: GameStateCreator<GameSlice> = (set, get) => ({
  activeActivity: null,
  clearInflationNotification: () => {
    set({ inflationNotification: null }, false, 'game/clearInflationNotification')
  },
  closeYearReport: () => {
    set({ gameStatus: 'playing' }, false, 'game/closeYearReport')
  },
  endReason: null,
  gameStatus: 'menu',
  inflationNotification: null,
  initializeGame: (countryId: string, archetype: string) => {
    const cId = countryId || get().setupCountryId
    if (!cId) return
    set(
      {
        countries: WORLD_COUNTRIES,
        gameStatus: 'playing',
        history: [],
        notifications: [],
        pendingApplications: [],
        pendingFreelanceApplications: [],
        player: createInitialPlayer(archetype, cId),
        turn: 1,
        year: 2024,
      },
      false,
      'game/initializeGame',
    )
  },
  isProcessingTurn: false,

  nextTurn: () => {
    processTurn(get, set)
  },

  resetGame: () => {
    set({
      activeActivity: null,
      countries: WORLD_COUNTRIES,
      endReason: null,
      gameStatus: 'menu',
      globalEvents: [],
      history: [],
      isProcessingTurn: false,
      notifications: [],
      pendingApplications: [],
      pendingEventNotification: null,
      pendingFreelanceApplications: [],
      player: null,
      setupCountryId: null,
      turn: 0,
      year: 2024,
    })
  },

  resolveCrisis: (actionType: string) => {
    const player = get().player
    if (!player) return

    if (actionType === 'bankruptcy') {
      set({ endReason: 'BANKRUPTCY', gameStatus: 'ended' })
      return
    }

    if (actionType === 'sell_asset') {
      // Продаем все активы
      let assetsValue = 0
      for (const a of player.assets) {
        assetsValue += a.value
      }

      get().performTransaction({ money: assetsValue }, { title: 'Продажа активов для спасения' })
      get().updatePlayer({
        assets: [],
      })
    } else if (actionType === 'emergency_loan') {
      const loanAmount = calculateEmergencyLoanAmount(player.stats.money)
      get().performTransaction({ money: loanAmount }, { title: 'Экстренный кредит' })

      get().updatePlayer((prev) => ({
        debts: [
          ...prev.debts,
          {
            id: `emergency_${String(Date.now())}`,
            interestRate: EMERGENCY_LOAN_RATE,
            name: 'Экстренный кредит (кризис)',
            principalAmount: loanAmount,
            quarterlyInterest: Math.round(
              (loanAmount * (EMERGENCY_LOAN_RATE / PERCENT_DIVISOR)) / QUARTERS_IN_YEAR,
            ),
            quarterlyPayment: Math.round(
              (loanAmount * (1 + EMERGENCY_LOAN_RATE / PERCENT_DIVISOR)) / EMERGENCY_LOAN_QUARTERS,
            ),
            quarterlyPrincipal: Math.round(loanAmount / EMERGENCY_LOAN_QUARTERS),
            remainingAmount: loanAmount,
            remainingQuarters: EMERGENCY_LOAN_QUARTERS,
            startTurn: get().turn,
            termQuarters: EMERGENCY_LOAN_QUARTERS,
            type: 'consumer_credit',
          },
        ],
      }))
    } else if (actionType === 'family_help') {
      const helpAmount = calculateFamilyHelp(player.personal.familyMembers)
      get().performTransaction({ money: helpAmount }, { title: 'Помощь семьи' })

      get().updatePlayer((prev) => ({
        personal: {
          ...prev.personal,
          familyMembers: prev.personal.familyMembers.map((m) => ({
            ...m,
            loyalty: Math.max(0, m.loyalty - FAMILY_LOYALTY_DROP),
          })),
        },
      }))
    }

    // Если баланс стал положительным, продолжаем игру
    const currentPlayer = get().player
    if (currentPlayer && currentPlayer.stats.money >= FINANCIAL_CRISIS_THRESHOLD) {
      set({ gameStatus: 'playing' })
    }
  },

  setActiveActivity: (activity: ActivityType | null) => {
    set({ activeActivity: activity }, false, 'game/setActiveActivity')
  },

  // Actions
  setSetupCountry: (id: string) => {
    set({ gameStatus: 'select_character', setupCountryId: id }, false, 'game/setSetupCountry')
  },

  setupCountryId: null,

  startSinglePlayer: () => {
    set(
      {
        countries: WORLD_COUNTRIES,
        gameStatus: 'setup',
      },
      false,
      'game/startSinglePlayer',
    )
  },

  // State
  turn: 0,
  year: 2024,
})
