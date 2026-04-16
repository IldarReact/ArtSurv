// src/core/model/slices/bank-slice.ts
import { nanoid } from 'nanoid'
import type { StateCreator } from 'zustand'

import type { GameStore } from '../../types'

export interface BankSlice {
  openDeposit: (amount: number) => void
  closeDeposit: (id: string) => void
  borrow: (amount: number) => void
  repay: (amount: number) => void
}

const LOAN_RATE_MARGIN = 5
const MIN_QUARTERLY_PAYMENT_RATE = 0.05
const DEPOSIT_RATE_FACTOR = 0.8
const MONTHS_IN_YEAR = 12

export const createBankSlice: StateCreator<GameStore, [], [], BankSlice> = (set, get) => ({
  borrow: (amount) => {
    const state = get()
    if (!state.player) return

    // В простом банке мы просто увеличиваем долг
    // Проверка лимита будет в UI, но на всякий случай можно и здесь
    state.performTransaction({ money: amount }, { title: 'Получение кредита' })

    const country = state.countries[state.player.countryId]
    const loanRate = country.keyRate + LOAN_RATE_MARGIN // Упрощенная ставка: ключ + 5%

    // Ищем существующий общий кредит или создаем новый
    const existingDebt = state.player.debts.find((d) => d.type === 'consumer_credit')

    if (existingDebt) {
      state.updatePlayer((prev) => ({
        debts: prev.debts.map((d) =>
          d.id === existingDebt.id
            ? {
                ...d,
                principalAmount: d.principalAmount + amount,
                // Пересчитываем платеж? В упрощенной схеме можно просто платить % + часть долга
                quarterlyPayment: Math.round(
                  (d.remainingAmount + amount) * MIN_QUARTERLY_PAYMENT_RATE,
                ), // 5% от суммы в квартал
                remainingAmount: d.remainingAmount + amount,
              }
            : d,
        ),
      }))
    } else {
      const debt = {
        id: nanoid(),
        interestRate: loanRate,
        name: 'Кредитная линия',
        principalAmount: amount,
        quarterlyInterest: 0, // Будет считаться в процессоре
        quarterlyPayment: Math.round(amount * MIN_QUARTERLY_PAYMENT_RATE), // Минимальный платеж 5%
        quarterlyPrincipal: 0,
        remainingAmount: amount,
        remainingQuarters: 40, // "Бессрочный" с большим запасом
        startTurn: state.turn,
        termQuarters: 40,
        type: 'consumer_credit' as const,
      }

      state.updatePlayer((prev) => ({
        debts: [...prev.debts, debt],
      }))
    }
  },

  closeDeposit: (id) => {
    const state = get()
    if (!state.player) return

    const deposit = state.player.assets.find((a) => a.id === id)
    if (deposit?.type !== 'deposit') return

    state.performTransaction({ money: deposit.currentValue }, { title: 'Закрытие вклада' })

    state.updatePlayer((prev) => ({
      assets: prev.assets.filter((a) => a.id !== id),
    }))
  },

  openDeposit: (amount) => {
    const state = get()
    if (!state.player) return

    if (!state.performTransaction({ money: -amount }, { title: 'Открытие вклада' })) {
      return
    }

    const country = state.countries[state.player.countryId]
    const depositRate = country.keyRate * DEPOSIT_RATE_FACTOR // Реалистичная ставка ниже ключевой

    const deposit = {
      currentValue: amount,
      expenses: 0,
      id: nanoid(),
      income: Math.round((amount * (depositRate / 100)) / MONTHS_IN_YEAR), // Месячный доход (в квартале будет *3)
      liquidity: 'high' as const,
      name: 'Сберегательный счет',
      purchasePrice: amount,
      risk: 'low' as const,
      type: 'deposit' as const,
      unrealizedGain: 0,
      value: amount,
    }

    state.updatePlayer((prev) => ({
      assets: [...prev.assets, deposit],
    }))

    state.pushNotification({
      message: `Вы открыли вклад на $${amount.toLocaleString()} под ${depositRate.toFixed(1)}% годовых.`,
      title: 'Вклад открыт',
      type: 'success',
    })
  },

  repay: (amount) => {
    const state = get()
    if (!state.player) return

    const debt = state.player.debts.find((d) => d.type === 'consumer_credit')
    if (!debt) return

    const actualRepay = Math.min(amount, debt.remainingAmount)

    if (!state.performTransaction({ money: -actualRepay }, { title: 'Погашение кредита' })) {
      return
    }

    state.updatePlayer((prev) => ({
      debts: prev.debts
        .map((d) =>
          d.id === debt.id
            ? {
                ...d,
                quarterlyPayment: Math.round(
                  (d.remainingAmount - actualRepay) * MIN_QUARTERLY_PAYMENT_RATE,
                ),
                remainingAmount: d.remainingAmount - actualRepay,
              }
            : d,
        )
        .filter((d) => d.remainingAmount > 0),
    }))
  },
})
