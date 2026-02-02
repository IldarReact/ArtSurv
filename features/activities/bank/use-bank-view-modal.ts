import { useMemo } from 'react'

import { useGameStore } from '@/core/model/store'

import { calculateCreditLimit, getDepositInterestRate, getLoanInterestRate } from './lib/bank-rules'

export function useBankViewModel() {
  const player = useGameStore((s) => s.player)
  const countries = useGameStore((s) => s.countries)

  return useMemo(() => {
    if (!player) return null

    const country = countries[player.countryId]
    const deposits = player.assets.filter((a) => a.type === 'deposit')
    const debts = player.debts

    const totalDeposits = deposits.reduce((sum, d) => sum + d.currentValue, 0)
    const totalDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0)

    const keyRate = country.keyRate
    const creditScore = player.creditScore
    const score = typeof creditScore === 'number' ? creditScore : creditScore.value

    return {
      creditLimit: calculateCreditLimit(player),
      debts,
      depositRate: getDepositInterestRate(country),
      deposits,
      keyRate,
      loanRate: getLoanInterestRate(country, score),
      player,
      totalDebt,
      totalDeposits,
    }
  }, [player, countries])
}
