'use client'

import { motion } from 'framer-motion'
import { SkullIcon, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getGameOverMessage } from '@/core/lib/defeat-conditions'
import { GAME_DURATION_YEARS } from '@/core/lib/game-duration'
import {
  getOnlinePlayers,
  isMultiplayerActive,
  setFinalScore,
  subscribeToFinalScoreChanges,
} from '@/core/lib/multiplayer'
import type { OnlinePlayer } from '@/core/lib/multiplayer/multiplayer.types'
import {
  calculateLifeScore,
  calculateNetWorth,
  MAX_LIFE_SCORE,
} from '@/core/model/history/life-history'
import { useGameStore } from '@/core/model/store'
import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'

const STAT_ORDER = ['happiness', 'health', 'sanity', 'intelligence'] as const
const STAT_LABELS: Record<(typeof STAT_ORDER)[number], string> = {
  happiness: 'Счастье',
  health: 'Здоровье',
  intelligence: 'Интеллект',
  sanity: 'Рассудок',
}

const CATEGORY_ORDER = ['family', 'work', 'education', 'investments', 'rest'] as const
const CATEGORY_LABELS: Record<(typeof CATEGORY_ORDER)[number], string> = {
  education: 'Обучение',
  family: 'Семья',
  investments: 'Инвестиции',
  rest: 'Отдых',
  work: 'Работа',
} as const

function rankOnlinePlayers(players: OnlinePlayer[]) {
  const sortedPlayers = [...players].sort((left, right) => {
    if (left.finalScore === null) {
      return right.finalScore === null ? left.name.localeCompare(right.name) : 1
    }
    if (right.finalScore === null) return -1
    return right.finalScore - left.finalScore || left.name.localeCompare(right.name)
  })

  let place = 0
  return sortedPlayers.map((player) => {
    if (player.finalScore !== null) place += 1
    return { place: player.finalScore === null ? null : place, player }
  })
}

export function GameEnd(): React.JSX.Element | null {
  const { endReason, gameStatus, history, lifeEvents, player, turn } = useGameStore()
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([])
  const score = player ? calculateLifeScore(history, lifeEvents, player, turn) : null
  const scoreTotal = score?.total
  const isOnlineGame = isMultiplayerActive()

  useEffect(() => {
    if (
      gameStatus !== 'ended' ||
      !player ||
      !endReason ||
      scoreTotal === undefined ||
      !isOnlineGame
    )
      return

    setFinalScore(scoreTotal)
    const updatePlayers = () => {
      setOnlinePlayers(
        getOnlinePlayers().map((onlinePlayer) =>
          onlinePlayer.isLocal ? { ...onlinePlayer, finalScore: scoreTotal } : onlinePlayer,
        ),
      )
    }
    updatePlayers()

    return subscribeToFinalScoreChanges(updatePlayers)
  }, [endReason, gameStatus, isOnlineGame, player, scoreTotal])

  if (gameStatus !== 'ended' || !player || !endReason || !score) return null

  const rankedPlayers = rankOnlinePlayers(onlinePlayers)
  const isComplete = endReason === 'COMPLETED'
  const outcome = getGameOverMessage(endReason)
  const title = outcome.title
  const message = isComplete
    ? `Вы прожили ${String(GAME_DURATION_YEARS)} игровых лет.`
    : outcome.message

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto p-4"
      initial={{ opacity: 0 }}
    >
      <Card className={`p-8 ${isOnlineGame ? 'max-w-6xl' : 'max-w-3xl'} w-full my-auto space-y-6`}>
        <div className="text-center">
          {isComplete ? (
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          ) : (
            <SkullIcon className="w-16 h-16 mx-auto text-destructive mb-4" />
          )}
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-xl text-muted-foreground">{message}</p>
        </div>

        <div
          className={
            isOnlineGame
              ? 'grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]'
              : 'space-y-6'
          }
        >
          <div className="space-y-6">
            <section aria-label="Итоговый счет" className="bg-muted p-6 rounded-lg space-y-3">
              <h2 className="text-xl font-bold">Итоговый счет</h2>
              {STAT_ORDER.map((stat) => (
                <div className="flex justify-between gap-4" key={stat}>
                  <span className="text-muted-foreground">{STAT_LABELS[stat]}</span>
                  <span className="font-semibold">{score.stats[stat].toFixed(1)} / 10</span>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Капитал</span>
                <span className="font-semibold">{score.capital.toFixed(1)} / 15</span>
              </div>
              {CATEGORY_ORDER.map((category) => (
                <div className="flex justify-between gap-4" key={category}>
                  <span className="text-muted-foreground">{CATEGORY_LABELS[category]}</span>
                  <span className="font-semibold">{score.categories[category].toFixed(1)} / 7</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between text-lg">
                <span className="font-bold">Всего</span>
                <span className="text-2xl font-bold text-primary">
                  {score.total.toFixed(1)} / {MAX_LIFE_SCORE}
                </span>
              </div>
            </section>

            <section aria-label="Финальные показатели" className="bg-card p-4 rounded-lg space-y-2">
              <h2 className="font-bold">Финальные показатели</h2>
              <p>Прожито лет: {history.length}</p>
              <p>Завершено кварталов: {turn}</p>
              <p>Деньги: ${player.stats.money.toLocaleString()}</p>
              <p>Чистый капитал: ${calculateNetWorth(player).toLocaleString()}</p>
              <p>Записей в истории: {lifeEvents.length}</p>
            </section>
          </div>

          {isOnlineGame && (
            <section aria-label="Итоги онлайн-игры" className="bg-muted p-6 rounded-lg space-y-3">
              <h2 className="text-xl font-bold">Рейтинг игроков</h2>
              {rankedPlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ожидание результатов игроков...</p>
              ) : (
                <ol className="space-y-2">
                  {rankedPlayers.map(({ place, player: onlinePlayer }) => (
                    <li
                      className="flex items-center justify-between gap-3 rounded-md bg-background/50 px-3 py-2"
                      key={onlinePlayer.clientId}
                    >
                      <span className="w-8 shrink-0 font-semibold">
                        {place === null ? '—' : `${String(place)}.`}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {onlinePlayer.name}
                        {onlinePlayer.isLocal && (
                          <span className="ml-1 text-muted-foreground">(вы)</span>
                        )}
                      </span>
                      <span className="shrink-0 font-semibold">
                        {onlinePlayer.finalScore === null
                          ? 'Ожидает'
                          : `${onlinePlayer.finalScore.toFixed(1)} / ${String(MAX_LIFE_SCORE)}`}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}
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
