'use client'

import { motion } from 'framer-motion'
import { Trophy, SkullIcon } from 'lucide-react'

import { useGameStore } from '@/core/model/store'
import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'

export function GameEnd(): React.JSX.Element | null {
  const { endReason, gameStatus, globalEvents, history, player, turn } = useGameStore()

  if (gameStatus !== 'ended') return null

  let totalHappiness = 0
  for (const snap of history) {
    totalHappiness += snap.happiness
  }

  const avgHappiness =
    history.length > 0 ? totalHappiness / history.length : (player?.stats.happiness ?? 0)

  const finalScore = avgHappiness * (player?.happinessMultiplier ?? 1)

  const isVictory = endReason === 'Конец игры' || endReason === 'Конец жизни'
  const isBankrupt = endReason === 'Банкротство'
  const isDead = endReason === 'Смерть'

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
    >
      <Card className="p-8 max-w-2xl w-full mx-4 space-y-6">
        <div className="text-center">
          {isVictory && (
            <>
              <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
              <h1 className="text-4xl font-bold mb-2">🎉 Поздравляем!</h1>
              <p className="text-xl text-muted-foreground">Вы успешно прожили 20 лет жизни</p>
            </>
          )}
          {isBankrupt && (
            <>
              <SkullIcon className="w-16 h-16 mx-auto text-destructive mb-4" />
              <h1 className="text-4xl font-bold mb-2">💸 Банкротство</h1>
              <p className="text-xl text-muted-foreground">
                Вы потратили всё до копейки и ушли в минус
              </p>
            </>
          )}
          {isDead && (
            <>
              <SkullIcon className="w-16 h-16 mx-auto text-destructive mb-4" />
              <h1 className="text-4xl font-bold mb-2">☠️ Конец пути</h1>
              <p className="text-xl text-muted-foreground">Здоровье истощено</p>
            </>
          )}
          {!isVictory && !isBankrupt && !isDead && (
            <>
              <h1 className="text-4xl font-bold mb-2">Игра окончена</h1>
              <p className="text-xl text-muted-foreground">{endReason}</p>
            </>
          )}
        </div>

        <div className="bg-muted p-6 rounded-lg space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Среднее счастье:</span>
            <span className="font-bold">{avgHappiness.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Модификатор:</span>
            <span className="font-bold">×{(player?.happinessMultiplier ?? 1).toFixed(1)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between text-lg">
            <span className="font-bold">ИТОГОВЫЙ СЧЁТ:</span>
            <span className="text-2xl font-bold text-primary">{finalScore.toFixed(1)}</span>
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg space-y-2">
          <p className="font-bold mb-2">📊 Финальная статистика</p>
          <p>Прожито лет: {Math.floor(turn / 4)}</p>
          <p>Совершено ходов: {turn}</p>
          <p>Капитал: {(player?.stats.money ?? 0).toLocaleString()} ₽</p>
          <p>Всего событий: {globalEvents.length}</p>
        </div>

        <Button
          className="w-full"
          onClick={() => {
            window.location.reload()
          }}
          size="lg"
        >
          Начать новую жизнь
        </Button>
      </Card>
    </motion.div>
  )
}
