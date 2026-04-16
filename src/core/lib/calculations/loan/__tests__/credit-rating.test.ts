import { describe, it, expect } from 'vitest'

import { calculateCreditRating, createDebt } from '../../loan-calculator'
import { createMockPlayer } from '../utils/mock-player'

describe('calculateCreditRating', () => {
  it('должен вернуть базовый рейтинг для игрока без кредитов', () => {
    const player = createMockPlayer()
    expect(
      calculateCreditRating({
        activeDebts: player.debts,
        cash: player.stats.money,
        monthlyIncome: player.quarterlySalary / 3,
      }),
    ).toBe(70)
  })

  it('должен снизить рейтинг за активные кредиты', () => {
    const player = createMockPlayer({
      debts: [
        createDebt(50000, 12, 4, 'consumer_credit', 'Кредит 1', 1),
        createDebt(30000, 12, 4, 'consumer_credit', 'Кредит 2', 1),
      ],
    })
    expect(
      calculateCreditRating({
        activeDebts: player.debts,
        cash: player.stats.money,
        monthlyIncome: player.quarterlySalary / 3,
      }),
    ).toBeLessThan(70)
  })

  it('должен снизить рейтинг за высокую долговую нагрузку', () => {
    const player = createMockPlayer({
      debts: [createDebt(200000, 12, 4, 'consumer_credit', 'Большой кредит', 1)],
      quarterlySalary: 90000,
    })
    expect(
      calculateCreditRating({
        activeDebts: player.debts,
        cash: player.stats.money,
        monthlyIncome: player.quarterlySalary / 3,
      }),
    ).toBeLessThan(60)
  })

  it('должен повысить рейтинг за большие накопления', () => {
    const player = createMockPlayer({
      stats: {
        energy: 100,
        happiness: 100,
        health: 100,
        intelligence: 100,
        money: 150000,
        sanity: 100,
      },
    })
    expect(
      calculateCreditRating({
        activeDebts: player.debts,
        cash: player.stats.money,
        monthlyIncome: player.quarterlySalary / 3,
      }),
    ).toBe(80)
  })

  it('должен снизить рейтинг за малые накопления', () => {
    const player = createMockPlayer({
      stats: {
        energy: 100,
        happiness: 100,
        health: 100,
        intelligence: 100,
        money: 5000,
        sanity: 100,
      },
    })
    expect(
      calculateCreditRating({
        activeDebts: player.debts,
        cash: player.stats.money,
        monthlyIncome: player.quarterlySalary / 3,
      }),
    ).toBe(65)
  })
})
