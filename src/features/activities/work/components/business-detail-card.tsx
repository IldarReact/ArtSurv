'use client'

import { Zap } from 'lucide-react'
import React from 'react'

import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'

interface BusinessDetailCardProps {
  cost: number
  description: string
  detailDialog?: React.ReactNode
  energyCost: number
  expenses: string
  image: string
  income: string
  onBuy?: () => void
  stressImpact: string
  title: string
  type: string
}

export function BusinessDetailCard({
  cost,
  description,
  detailDialog,
  energyCost,
  expenses,
  image,
  income,
  onBuy,
  stressImpact: _stressImpact,
  title,
  type,
}: BusinessDetailCardProps) {
  void _stressImpact
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
      <div className="relative h-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={title} className="w-full h-full object-cover" src={image} />
        <div className="absolute top-2 left-2">
          <Badge
            className="bg-black/60 backdrop-blur-md text-white border-white/10"
            variant="secondary"
          >
            {type}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <div className="flex flex-col items-end">
            <div className="text-green-400 font-bold text-sm whitespace-nowrap ml-2">
              ${cost.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              <Zap className="w-3 h-3" />
              <span>-{energyCost}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/60 mb-3 line-clamp-2">{description}</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/5 rounded p-1.5">
            <span className="text-[10px] text-white/50 block">Доход</span>
            <span className="text-green-400 font-bold text-xs">{income}</span>
          </div>
          <div className="bg-white/5 rounded p-1.5">
            <span className="text-[10px] text-white/50 block">Расходы</span>
            <span className="text-rose-400 font-bold text-xs">{expenses}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {detailDialog}
          <Button
            className="flex-1 text-xs h-9 bg-white text-black hover:bg-white/90 font-bold"
            onClick={onBuy}
          >
            Открыть
          </Button>
        </div>
      </div>
    </div>
  )
}
