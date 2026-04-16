import { Zap, AlertTriangle, Lightbulb } from 'lucide-react'

import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'

interface StartupDetailCardProps {
  description: string
  energyCost: number
  image: string
  onStart?: () => void
  potentialIncome: string
  requirements: string
  riskLevel: 'Низкий' | 'Средний' | 'Высокий' | 'Экстремальный'
  stressImpact: string
  title: string
  type: string
}

export function StartupDetailCard({
  description,
  energyCost,
  image,
  onStart,
  potentialIncome,
  requirements,
  riskLevel,
  stressImpact,
  title,
  type,
}: StartupDetailCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Низкий':
        return 'text-[#004d00]'
      case 'Средний':
        return 'text-yellow-400'
      case 'Высокий':
        return 'text-orange-400'
      case 'Экстремальный':
        return 'text-rose-400'
      default:
        return 'text-white'
    }
  }

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
            {type}
          </Badge>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <div className={`font-bold text-sm flex items-center gap-1 ${getRiskColor(riskLevel)}`}>
              <AlertTriangle className="w-4 h-4" />
              Риск: {riskLevel}
            </div>
          </div>

          <p className="text-white/70 text-sm mb-4">{description}</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-2 col-span-2">
              <span className="text-xs text-white/50 block mb-1">Потенциал дохода</span>
              <span className="text-[#004d00] font-bold text-lg">{potentialIncome}</span>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <span className="text-xs text-white/50 block mb-1">Энергия</span>
              <span className="text-amber-400 font-semibold text-sm flex items-center gap-1">
                <Zap className="w-3 h-3" /> -{energyCost}/кв
              </span>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <span className="text-xs text-white/50 block mb-1">Стресс</span>
              <span className="text-purple-400 font-semibold text-sm flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {stressImpact}
              </span>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-200">
              <span className="font-bold">Требование:</span> {requirements}
            </p>
          </div>
        </div>

        <Button
          className="w-full bg-white text-black hover:bg-white/90 font-bold"
          disabled={true} // Пока отключено, так как нужна идея
          onClick={onStart}
        >
          Нужна идея
        </Button>
      </div>
    </div>
  )
}
