'use client'

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Utensils,
  Home,
  Car,
  CreditCard,
  Landmark,
  HelpCircle,
} from 'lucide-react'
import React from 'react'

import { useGameStore } from '@/core/model/store'
import type { ExpensesBreakdown, Player } from '@/core/types'
import { Progress } from '@/shared/components/progress'

interface SummarySectionProps {
  netProfit: number
  player: Player
  totalExpenses: number
  totalIncome: number
  totalTax: number
}

function SummarySection({
  netProfit,
  player,
  totalExpenses,
  totalIncome,
  totalTax,
}: SummarySectionProps) {
  return (
    <div className="bg-zinc-900/90 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="w-5 h-5 text-green-400" />
        <h3 className="font-bold text-white">
          {player.personal.familyMembers.length > 0
            ? 'Семейные финансы (квартал)'
            : 'Финансы (квартал)'}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400">Доходы</span>
          </div>
          <span className="font-bold text-white text-lg">+${totalIncome.toLocaleString()}</span>
        </div>

        <div className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-red-400">Расходы</span>
          </div>
          <span className="font-bold text-white text-lg">-${totalExpenses.toLocaleString()}</span>
        </div>

        <div className="bg-white/5 rounded-xl p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-rose-400" />
            <span className="text-rose-400">Налоги</span>
          </div>
          <span className="font-bold text-white text-lg">-${totalTax.toLocaleString()}</span>
        </div>

        <div className="h-px bg-white/10 my-2" />

        <div className="flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-white/80" />
            <span className="font-bold text-white">Прибыль</span>
          </div>
          <span
            className={`font-bold text-xl ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}
          >
            {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

interface ExpensesSectionProps {
  expenses: ExpensesBreakdown
  player: Player
  totalExpenses: number
  totalIncome: number
  totalTax: number
}

function ExpensesSection({
  expenses,
  player,
  totalExpenses,
  totalIncome,
  totalTax,
}: ExpensesSectionProps) {
  const budgetLoad = ((totalExpenses + totalTax) / (totalIncome || 1)) * 100

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:col-span-2">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <TrendingDown className="w-4 h-4 text-white/60" />
        {player.personal.familyMembers.length > 0
          ? 'Структура расходов семьи'
          : 'Структура расходов'}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ExpenseItem
          amount={expenses.food}
          icon={<Utensils className="w-4 h-4 text-orange-400" />}
          label="Питание"
        />
        <ExpenseItem
          amount={expenses.housing}
          icon={<Home className="w-4 h-4 text-blue-400" />}
          label="Жилье"
        />
        <ExpenseItem
          amount={expenses.transport}
          icon={<Car className="w-4 h-4 text-purple-400" />}
          label="Транспорт"
        />
        <ExpenseItem
          amount={expenses.credits}
          icon={<CreditCard className="w-4 h-4 text-red-400" />}
          label="Кредиты"
        />
        <ExpenseItem
          amount={expenses.mortgage}
          icon={<Landmark className="w-4 h-4 text-amber-400" />}
          label="Ипотека"
        />
        <ExpenseItem
          amount={expenses.other}
          icon={<HelpCircle className="w-4 h-4 text-zinc-400" />}
          label="Другое"
        />
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-xs text-white/40 mb-2">
          <span>Нагрузка на бюджет (Расходы + Налоги)</span>
          <span>{Math.min(100, Math.round(budgetLoad))}%</span>
        </div>
        <Progress
          className={`h-2 ${totalExpenses + totalTax > totalIncome ? 'bg-red-900' : ''}`}
          value={budgetLoad}
        />
      </div>
    </div>
  )
}

export function FamilyFinancesCard() {
  const { player } = useGameStore()

  if (!player) return null

  const report = player.quarterlyReport

  const { expenses, income, netProfit, taxes } = report

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <SummarySection
        netProfit={netProfit}
        player={player}
        totalExpenses={expenses.total}
        totalIncome={income.total}
        totalTax={taxes.total}
      />

      <ExpensesSection
        expenses={expenses}
        player={player}
        totalExpenses={expenses.total}
        totalIncome={income.total}
        totalTax={taxes.total}
      />
    </div>
  )
}

function ExpenseItem({
  amount,
  icon,
  label,
}: {
  amount: number
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-white/60">{label}</span>
      </div>
      <div className="text-lg font-bold text-white">${amount.toLocaleString()}</div>
    </div>
  )
}
