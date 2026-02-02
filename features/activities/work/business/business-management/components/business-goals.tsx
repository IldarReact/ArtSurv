'use client'

import { Target, CheckCircle2, Circle } from 'lucide-react'
import React from 'react'

import type { Business } from '@/core/types/business.types'

interface BusinessGoalsProps {
  goals?: Business['businessGoals']
}

export function BusinessGoals({ goals }: BusinessGoalsProps) {
  if (!goals || goals.length === 0) return null

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-emerald-400" />
        Бизнес-цели
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`p-4 rounded-xl border ${
              goal.isCompleted
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {goal.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-white/20" />
                  )}
                  <h4
                    className={`font-bold ${goal.isCompleted ? 'text-emerald-400' : 'text-white'}`}
                  >
                    {goal.title}
                  </h4>
                </div>
                <p className="text-sm text-white/60 mb-3">{goal.description}</p>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Прогресс</span>
                    <span className="text-white/60">
                      {goal.current} / {String(goal.target)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        goal.isCompleted ? 'bg-emerald-400' : 'bg-blue-400'
                      }`}
                      style={{
                        width: `${String(Math.min(100, (goal.current / goal.target) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
