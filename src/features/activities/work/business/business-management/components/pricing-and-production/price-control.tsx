'use client'

import { Target, CheckCircle2 } from 'lucide-react'
import React from 'react'

import type { BusinessGoal } from '@/core/types/business.types'

interface PriceControlProps {
  calculatedPrice?: number
  formatCurrency?: (value: number) => string
  goal?: BusinessGoal
  handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  price: number
}

export function PriceControl({
  calculatedPrice,
  formatCurrency,
  goal,
  handlePriceChange,
  price,
}: PriceControlProps) {
  const goalTarget = goal?.target ?? 0
  const isGoalCompleted = goal?.isCompleted === true || (goal !== undefined && price >= goalTarget)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-white/80">Цена услуги/товара</label>
          {goal && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 w-fit">
              {isGoalCompleted ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <Target className="w-3 h-3 text-white/40" />
              )}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isGoalCompleted ? 'text-emerald-400' : 'text-white/40'
                }`}
              >
                Цель: {String(goalTarget)}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold text-yellow-400" data-testid="price-display">
            {price} <span className="text-sm text-white/40">/ 10</span>
          </span>
          {calculatedPrice && formatCurrency && (
            <span className="text-sm font-semibold text-emerald-400">
              {formatCurrency(calculatedPrice)}
            </span>
          )}
        </div>
      </div>
      <input
        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
        max="10"
        min="1"
        onChange={handlePriceChange}
        type="range"
        value={price}
      />
      <div className="flex justify-between text-xs text-white/40">
        <div className="flex flex-col items-start">
          <span>Дёшево (0.5x)</span>
          <span className="text-[10px] opacity-50">Мин. прибыль, макс. спрос</span>
        </div>
        <div className="flex flex-col items-end">
          <span>Дорого (5x)</span>
          <span className="text-[10px] opacity-50">Макс. прибыль, мин. спрос</span>
        </div>
      </div>
      <div className="p-3 bg-yellow-400/5 border border-yellow-400/10 rounded-lg">
        <p className="text-[11px] text-yellow-200/70 leading-relaxed">
          Шкала цен привязана к себестоимости производства.
          <br />
          <span className="text-yellow-400 font-bold">Уровень 10</span> = цена в 5 раз выше затрат
          на производство единицы товара.
          <br />
          <span className="text-rose-400 font-bold">Внимание:</span> Слишком высокая цена
          экспоненциально снижает спрос, если репутация недостаточно высока.
        </p>
      </div>
    </div>
  )
}
