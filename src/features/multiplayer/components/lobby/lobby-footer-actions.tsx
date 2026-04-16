'use client'

import { Play } from 'lucide-react'

import { Button } from '@/shared/components/button'

interface LobbyFooterActionsProps {
  canReady: boolean
  canStart: boolean
  isReady: boolean
  onStartGame: () => void
  onToggleReady: () => void
}

export function LobbyFooterActions({
  canReady,
  canStart,
  isReady,
  onStartGame,
  onToggleReady,
}: LobbyFooterActionsProps) {
  return (
    <div className="space-y-3">
      <Button
        className={`w-full h-12 text-base font-medium transition-all ${
          isReady
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
        }`}
        disabled={!canReady}
        onClick={onToggleReady}
      >
        {isReady ? 'Вы готовы' : 'Готов к игре'}
      </Button>

      {canStart && (
        <Button
          className="w-full h-14 text-lg font-bold shadow-lg transition-all bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-900/20 animate-pulse"
          onClick={onStartGame}
        >
          <Play className="w-5 h-5 mr-2" />
          Начать игру
        </Button>
      )}
    </div>
  )
}
