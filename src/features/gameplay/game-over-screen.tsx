'use client'

import { Skull, Brain, Frown, DollarSign } from 'lucide-react'

import { getGameOverMessage } from '@/core/lib/defeat-conditions'
import { getQuarter } from '@/core/lib/quarter'
import { useGameStore } from '@/core/model/store'
import type { GameOverReason } from '@/core/types/game.types'
import { Button } from '@/shared/components/button'

export function GameOverScreen() {
  const { endReason, player, resetGame, turn, year } = useGameStore()

  if (!endReason) return null

  const { message, title } = getGameOverMessage(endReason as GameOverReason)

  // Иконка в зависимости от причины
  const getIcon = () => {
    switch (endReason) {
      case 'DEATH':
        return <Skull className="w-24 h-24 text-red-500" />
      case 'MENTAL_BREAKDOWN':
        return <Brain className="w-24 h-24 text-purple-500" />
      case 'DEGRADATION':
        return <Brain className="w-24 h-24 text-orange-500" />
      case 'DEPRESSION':
        return <Frown className="w-24 h-24 text-blue-500" />
      case 'BANKRUPTCY':
        return <DollarSign className="w-24 h-24 text-yellow-500" />
    }
  }

  // Цвет фона в зависимости от причины
  const getBgGradient = (): string => {
    switch (endReason) {
      case 'DEATH':
        return 'from-red-950/50 to-black'
      case 'MENTAL_BREAKDOWN':
        return 'from-purple-950/50 to-black'
      case 'DEGRADATION':
        return 'from-orange-950/50 to-black'
      case 'DEPRESSION':
        return 'from-blue-950/50 to-black'
      case 'BANKRUPTCY':
        return 'from-yellow-950/50 to-black'
      default:
        return 'from-zinc-950/50 to-black'
    }
  }

  const quartersPlayed = turn
  const yearsPlayed = Math.floor(quartersPlayed / 4)
  const currentQuarter = getQuarter(quartersPlayed)

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-linear-to-b ${getBgGradient()} backdrop-blur-sm`}
    >
      <div className="max-w-2xl w-full mx-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
        {/* Иконка */}
        <div className="flex justify-center mb-6">{getIcon()}</div>

        {/* Заголовок */}
        <h1 className="text-4xl font-bold text-center mb-4 text-white">{title}</h1>

        {/* Описание */}
        <p className="text-lg text-center text-white/80 mb-8">{message}</p>

        {/* Статистика */}
        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
          <h2 className="text-xl font-semibold mb-4 text-white">📊 Статистика игры</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-white/60 mb-1">Прожито времени</div>
              <div className="text-2xl font-bold text-white">
                {yearsPlayed > 0 &&
                  `${String(yearsPlayed)} ${
                    yearsPlayed === 1 ? 'год' : yearsPlayed < 5 ? 'года' : 'лет'
                  }`}
                {currentQuarter > 0 && ` ${String(currentQuarter)} кв.`}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-white/60 mb-1">Финальный год</div>
              <div className="text-2xl font-bold text-white">{year}</div>
            </div>

            {player && (
              <>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Капитал</div>
                  <div className="text-2xl font-bold text-white">
                    ${player.stats.money.toLocaleString()}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-sm text-white/60 mb-1">Бизнесов</div>
                  <div className="text-2xl font-bold text-white">{player.businesses.length}</div>
                </div>

                {player.personal.familyMembers.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-4 col-span-2">
                    <div className="text-sm text-white/60 mb-1">Семья</div>
                    <div className="text-lg text-white">
                      {player.personal.familyMembers.map((m) => m.name).join(', ')}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-4">
          <Button
            className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 py-6 text-lg rounded-xl transition-all duration-300"
            onClick={resetGame}
          >
            Начать новую жизнь
          </Button>
        </div>

        {/* Подсказка */}
        <p className="text-center text-white/40 text-sm mt-6">
          Попробуйте еще раз и избегайте ошибок прошлого
        </p>
      </div>
    </div>
  )
}
