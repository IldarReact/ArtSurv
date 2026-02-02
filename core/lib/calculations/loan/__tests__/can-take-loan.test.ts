import { describe, it, expect } from 'vitest'

import { canTakeLoan, createDebt } from '../../loan-calculator'
import { createMockPlayer } from '../utils/mock-player'

describe('canTakeLoan', () => {
  it('должен разрешить взять кредит при хороших условиях', () => {
    const player = createMockPlayer({
      quarterlySalary: 300000,
      stats: {
        energy: 100,
        happiness: 100,
        health: 100,
        intelligence: 100,
        money: 50000,
        sanity: 100,
      },
    })
    expect(
      canTakeLoan({
        activeDebts: player.debts,
        amount: 500000,
        cash: player.stats.money,
        debtType: 'mortgage',
        monthlyIncome: player.quarterlySalary / 3,
      }),
    ).toBe(true)
  })

  it('должен запретить взять слишком большой кредит', () => {
    const player = createMockPlayer({
      quarterlySalary: 90000,
      stats: {
        energy: 100,
        happiness: 100,
        health: 100,
        intelligence: 100,
        money: 10000,
        sanity: 100,
      },
    })
    expect(
      canTakeLoan({
        activeDebts: player.debts,
        amount: 10000000,
        cash: player.stats.money,
        debtType: 'mortgage',
        monthlyIncome: player.quarterlySalary / 3,
      }),
    ).toBe(false)
  })

  it('должен запретить взять кредит при низком рейтинге', () => {
    const player = createMockPlayer({
      debts: Array(4)
        .fill(null)
        .map((_, i) => createDebt(100000, 12, 4, 'consumer_credit', `Кредит ${i + 1}`, 1)),
      quarterlySalary: 90000,
      stats: {
        energy: 100,
        happiness: 100,
        health: 100,
        intelligence: 100,
        money: 1000,
        sanity: 100,
      },
    })
    expect(
      canTakeLoan({
        activeDebts: player.debts,
        amount: 50000,
        cash: player.stats.money,
        debtType: 'consumer_credit',
        monthlyIncome: player.quarterlySalary / 3,
      }),
    ).toBe(false)
  })
})
