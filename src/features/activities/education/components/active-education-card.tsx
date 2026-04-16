import { Zap, Brain } from 'lucide-react'
import React from 'react'

import { Badge } from '@/shared/components/badge'

interface ActiveEducationCardProps {
  energy: number
  progress: number
  title: string
  total: number
}

export function ActiveEducationCard({ energy, progress, title, total }: ActiveEducationCardProps) {
  const percentage = Math.round((progress / total) * 100)

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-white">{title}</h4>
          <p className="text-xs text-white/50">В процессе обучения</p>
        </div>
      </div>

      {/* Stat Modifiers */}
      <div className="flex gap-2 flex-wrap">
        <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30" variant="secondary">
          <Zap className="w-3 h-3 mr-1" />-{energy}/кв
        </Badge>
        <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30" variant="secondary">
          <Brain className="w-3 h-3 mr-1" />
          +1/кв
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-white/70">
          <span>Прогресс</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${String(percentage)}%` }}
          />
        </div>
        <p className="text-xs text-white/40 text-right">Осталось: {total - progress} кв.</p>
      </div>
    </div>
  )
}
