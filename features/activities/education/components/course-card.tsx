import { DollarSign, Clock, Zap, Lightbulb } from 'lucide-react'
import React from 'react'

import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'

export interface CourseCardProps {
  cost: number
  description: string
  duration: string
  energyCost: number
  image: string
  inflatedCost?: number
  intelligenceBonus: number
  onEnroll?: () => void
  skillBonus?: string
  title: string
}

export function CourseCard({
  cost,
  description,
  duration,
  energyCost,
  image,
  inflatedCost,
  intelligenceBonus,
  onEnroll,
  skillBonus,
  title,
}: CourseCardProps) {
  const displayCost = inflatedCost ?? cost

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row mb-4 hover:border-white/20 transition-colors">
      <div className="w-full md:w-1/3 h-48 md:h-auto relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={title} className="w-full h-full object-cover" src={image} />
        <div className="absolute top-2 left-2">
          <Badge
            className="bg-black/60 backdrop-blur-md text-white border-white/10"
            variant="secondary"
          >
            Курс
          </Badge>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <div className="text-[#004d00] font-bold text-lg flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {displayCost.toLocaleString()}
            </div>
          </div>

          <p className="text-white/70 text-sm mb-4 line-clamp-2">{description}</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-2">
              <span className="text-xs text-white/50 block mb-1">Длительность</span>
              <span className="text-white font-semibold text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" /> {duration}
              </span>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <span className="text-xs text-white/50 block mb-1">Энергия</span>
              <span className="text-amber-400 font-semibold text-sm flex items-center gap-1">
                <Zap className="w-3 h-3" /> -{energyCost}
              </span>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <span className="text-xs text-white/50 block mb-1">Интеллект</span>
              <span className="text-blue-400 font-semibold text-sm flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> +{intelligenceBonus}
              </span>
            </div>
            {skillBonus && (
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-xs text-white/50 block mb-1">Навык</span>
                <span className="text-purple-400 font-semibold text-sm">{skillBonus}</span>
              </div>
            )}
          </div>
        </div>

        <Button
          className="w-full bg-white text-black hover:bg-white/90 font-bold"
          onClick={onEnroll}
        >
          Записаться
        </Button>
      </div>
    </div>
  )
}
