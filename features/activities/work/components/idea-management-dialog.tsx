import { Brain, Rocket, TrendingUp, AlertTriangle, DollarSign, Clock } from 'lucide-react'
import React from 'react'

import { calculateDevelopmentCost, calculateDevelopmentTime } from '@/core/lib/idea-generator'
import type { Skill } from '@/core/types'
import type { BusinessIdea } from '@/core/types/idea.types'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Progress } from '@/shared/ui/progress'

interface IdeaManagementDialogProps {
  isOpen: boolean
  onClose: () => void
  idea: BusinessIdea
  playerMoney?: number
  playerSkills?: Skill[]
  onDevelop: (ideaId: string, amount: number) => void
  onLaunch: (ideaId: string) => void
  onDiscard: (ideaId: string) => void
  playerEnergy: number
}

export function IdeaManagementDialog({
  isOpen,
  onClose,
  idea,
  playerMoney = 0,
  playerSkills = [],
  onDevelop,
  onLaunch,
  onDiscard,
}: IdeaManagementDialogProps) {
  const [investAmount, setInvestAmount] = React.useState<number>(0)

  const costForNextStage = calculateDevelopmentCost(idea)
  const estimatedTime = calculateDevelopmentTime(idea, playerSkills)

  // Рассчитываем, сколько осталось вложить для завершения стадии
  const remainingCost = costForNextStage * (1 - idea.developmentProgress / 100)

  // Устанавливаем сумму инвестиции по умолчанию (либо остаток, либо все деньги)
  React.useEffect(() => {
    if (isOpen) {
      setInvestAmount(Math.min(playerMoney, Math.ceil(remainingCost)))
    }
  }, [isOpen, playerMoney, remainingCost])

  const handleDevelop = () => {
    onDevelop(idea.id, investAmount)
    // Если стадия завершена, закрываем диалог (или обновляем)
    if (investAmount >= remainingCost) {
      // Можно добавить анимацию успеха
    }
  }

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'idea':
        return 'Концепция'
      case 'prototype':
        return 'Прототип'
      case 'mvp':
        return 'MVP'
      case 'launched':
        return 'Запущен'
      default:
        return stage
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      case 'high':
        return 'text-orange-400'
      case 'very_high':
        return 'text-red-400'
      default:
        return 'text-white'
    }
  }

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'Низкий'
      case 'medium':
        return 'Средний'
      case 'high':
        return 'Высокий'
      case 'very_high':
        return 'Очень высокий'
      default:
        return risk
    }
  }

  const getSuccessChanceLabel = (risk: string) => {
    switch (risk) {
      case 'low':
        return '90%'
      case 'medium':
        return '70%'
      case 'high':
        return '40%'
      case 'very_high':
        return '15%'
      default:
        return '50%'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6 text-purple-400" />
            {idea.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Основная информация */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Стадия</span>
              </div>
              <p className="text-xl font-bold">{getStageLabel(idea.stage)}</p>
              <Progress value={idea.developmentProgress} className="h-2 bg-white/10" />
              <p className="text-xs text-white/40">
                {idea.developmentProgress.toFixed(0)}% завершено
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Риск провала</span>
              </div>
              <p className={`text-xl font-bold ${getRiskColor(idea.riskLevel)}`}>
                {getRiskLabel(idea.riskLevel)}
              </p>
              <p className="text-xs text-white/40">
                Шанс успеха: {getSuccessChanceLabel(idea.riskLevel)}
              </p>
            </div>
          </div>

          {/* Финансы */}
          <div className="bg-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-bold uppercase">Потенциальный доход</p>
                  <p className="text-lg font-bold text-green-400">
                    {(idea.potentialReturn * 100).toFixed(0)}% годовых
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-bold uppercase">Разработка</p>
                  <p className="text-lg font-bold text-blue-400">{estimatedTime} кв.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/60 leading-relaxed bg-white/5 p-4 rounded-xl italic">
            "{idea.description}"
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleDevelop}
            disabled={playerMoney < investAmount || investAmount <= 0}
            className="flex-1 h-12 bg-white text-black hover:bg-zinc-200 font-bold"
          >
            Вложить ${investAmount.toLocaleString()}
          </Button>

          {idea.developmentProgress >= 100 && (
            <Button
              onClick={() => onLaunch(idea.id)}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Запустить
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={() => onDiscard(idea.id)}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 font-bold"
          >
            Удалить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
