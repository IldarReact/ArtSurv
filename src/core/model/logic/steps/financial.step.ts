import { processFinancials } from '../turns/financial-processor'
import type { TurnStep } from './step.types'

export const financialStep: TurnStep = (ctx, state) => {
  const res = processFinancials(
    ctx.prev,
    state.player.countryId,
    state.player.personal.familyMembers,
    state.lifestyle.expenses,
    state.lifestyle.breakdown,
    state.business,
    state.statModifiers.income ?? 0,
  )

  state.financial.quarterlyReport = res.quarterlyReport
  state.financial.netProfit = res.netProfit
  state.financial.adjustedNetProfit = res.netProfit
  state.country = res.country

  // Амортизация долгов (уменьшение остатка долга на величину выплаченного основного долга)
  // Мы берем выплату из отчета и вычитаем ее из остатка долга игрока в TurnState
  const expenses = res.quarterlyReport.expenses
  const totalDebtPayment = expenses.credits + expenses.mortgage

  if (totalDebtPayment > 0) {
    state.player.debts = state.player.debts
      .map((d) => {
        // Проценты за этот квартал
        const QUARTERS_PER_YEAR = 4
        const quarterlyRate = d.interestRate / 100 / QUARTERS_PER_YEAR
        const interestPart = Math.round(d.remainingAmount * quarterlyRate)
        // Все что сверх процентов идет в тело долга
        // Но так как у нас теперь "Кредитная линия", мы просто гасим сколько можем
        // Если это фиксированный кредит, используем d.quarterlyPayment
        const payment = d.type === 'consumer_credit' ? expenses.credits : d.quarterlyPayment
        const principalPart = Math.max(0, payment - interestPart)

        return {
          ...d,
          remainingAmount: Math.max(0, d.remainingAmount - principalPart),
          remainingQuarters: d.remainingQuarters > 0 ? d.remainingQuarters - 1 : 0,
        }
      })
      .filter((d) => d.remainingAmount > 1) // Убираем копеечные долги
  }
}
