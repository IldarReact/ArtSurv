'use client'

import { motion } from 'framer-motion'
import { Target, CheckCircle2 } from 'lucide-react'
import React from 'react'

import type { BusinessGoal } from '@/core/types/business.types'
import { cn } from '@/shared/utils/utils'

interface ProductionControlProps {
  capacity?: number
  goal?: BusinessGoal
  handleQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  inventory?: {
    currentStock: number
    maxStock: number
  }
  quantity: number
}

export function ProductionControl({
  capacity,
  goal,
  handleQuantityChange,
  inventory,
  quantity,
}: ProductionControlProps) {
  const goalTarget = goal?.target ?? 0
  const isGoalCompleted =
    goal?.isCompleted === true || (goal !== undefined && quantity >= goalTarget)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-white/80">План производства</label>
          <div className="flex items-center gap-2">
            {capacity !== undefined && (
              <span className="text-[10px] text-blue-400/80 font-bold uppercase tracking-wider">
                Макс: {capacity}
              </span>
            )}
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
        </div>
        <span className="text-2xl font-bold text-blue-400">
          {quantity} <span className="text-sm text-white/40">ед.</span>
        </span>
      </div>
      <input
        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
        max="1000"
        min="0"
        onChange={handleQuantityChange}
        step="10"
        type="range"
        value={quantity}
      />
      <div className="flex justify-between text-xs text-white/40">
        <span>0</span>
        <span>1000</span>
      </div>

      {/* Визуальный склад */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-white/40">
          <span>Заполненность склада</span>
          <span>
            {inventory?.currentStock ?? 0} / {inventory?.maxStock ?? 1000}
          </span>
        </div>
        <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
          <motion.div
            animate={{
              width: `${String(
                Math.min(
                  100,
                  ((inventory?.currentStock ?? 0) / (inventory?.maxStock ?? 1000)) * 100,
                ),
              )}%`,
            }}
            className={cn(
              'h-full transition-all duration-500',
              (inventory?.currentStock ?? 0) / (inventory?.maxStock ?? 1000) > 0.9
                ? 'bg-red-500/50'
                : 'bg-blue-500/50',
            )}
            initial={{ width: 0 }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/80 pointer-events-none">
            {Math.round(((inventory?.currentStock ?? 0) / (inventory?.maxStock ?? 1000)) * 100)}%
          </div>
        </div>
      </div>
    </div>
  )
}
