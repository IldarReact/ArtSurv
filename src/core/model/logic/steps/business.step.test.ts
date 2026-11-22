import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TurnState } from '../turn/turn-state'
import { businessStep } from './business.step'

const { processBusinessTurnMock } = vi.hoisted(() => ({
  processBusinessTurnMock: vi.fn(),
}))

vi.mock('../turns/business-turn-processor', () => ({
  processBusinessTurn: processBusinessTurnMock,
}))

describe('businessStep life events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('records each active business quarter with the actual profit', () => {
    const business = {
      id: 'business-1',
      lastQuarterSummary: { netProfit: 4_000 },
      name: 'Cafe',
      quarterlyExpenses: 15_000,
      quarterlyIncome: 20_000,
      quarterlyTax: 1_000,
      state: 'active',
    } as unknown as TurnState['player']['businesses'][number]
    processBusinessTurnMock.mockReturnValue({
      notifications: [],
      playerRoleEnergyCost: 0,
      playerRoleSanityCost: 0,
      protectedSkills: [],
      totalExpenses: 16_000,
      totalIncome: 20_000,
      totalTax: 1_000,
      updatedBusinesses: [business],
      updatedSkills: [],
    })
    const state = {
      business: { totalExpenses: 0, totalIncome: 0, totalTax: 0 },
      country: {},
      globalMarketValue: 1,
      lifeEvents: [],
      notifications: [],
      pendingStatEffects: [],
      player: { businesses: [business], personal: { skills: [] } },
      protectedSkills: new Set<string>(),
    } as unknown as TurnState

    businessStep({ prev: {} as never, turn: 1, year: 2024 }, state)

    expect(state.lifeEvents).toContainEqual(
      expect.objectContaining({
        amount: 20_000,
        category: 'work',
        entityName: 'Cafe',
        gainOrLoss: 4_000,
        kind: 'business_quarter',
        turn: 1,
        year: 2024,
      }),
    )
  })
})
