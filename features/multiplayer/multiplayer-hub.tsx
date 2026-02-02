'use client'

import { Users, CheckCircle2, Circle, ChevronDown, ChevronUp, Edit2, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getOnlinePlayers, setPlayerName } from '@/core/lib/multiplayer'
import { subscribeToReadyStatus } from '@/core/lib/multiplayer'
import type { OnlinePlayer as Player } from '@/core/lib/multiplayer/multiplayer.types'
import { Button } from '@/shared/components/button'

export type { Player }

export function MultiplayerHud() {
  const [players, setPlayers] = useState<Player[]>(getOnlinePlayers())
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    // Подписываемся на обновления статуса, чтобы перерисовывать список
    const unsubscribe = subscribeToReadyStatus(() => {
      setPlayers(getOnlinePlayers())
    }) as () => void

    // Дополнительно: обновляем список каждую секунду
    const interval = setInterval(() => {
      setPlayers(getOnlinePlayers())
    }, 1000)

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
      clearInterval(interval)
    }
  }, [])

  // Если никто не в комнате — показываем кнопку создания
  const urlParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const hasRoom = urlParams?.get('room')

  return (
    <div className="fixed top-20 right-4 md:top-24 md:right-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl z-40 max-w-xs shadow-xl transition-all hover:bg-black/30">
      {hasRoom && (
        <>
          {/* Header - всегда видим */}
          <button
            className="flex items-center justify-between gap-3 p-4 w-full cursor-pointer select-none border-none bg-transparent"
            onClick={() => {
              setIsCollapsed(!isCollapsed)
            }}
            type="button"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/70" />
              <span className="text-white font-bold text-sm">Игроки</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-white/60">
                {players.length}
              </span>
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4 text-white/50" />
              ) : (
                <ChevronUp className="w-4 h-4 text-white/50" />
              )}
            </div>
          </button>

          {/* Content - сворачивается */}
          {!isCollapsed && (
            <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
              {/* Редактирование имени */}
              {isEditingName ? (
                <div className="space-y-2">
                  <input
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                    maxLength={20}
                    onChange={(e) => {
                      setNewName(e.target.value)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (newName.trim()) {
                          setPlayerName(newName.trim())
                          setIsEditingName(false)
                          setNewName('')
                        }
                      }
                      if (e.key === 'Escape') {
                        setIsEditingName(false)
                        setNewName('')
                      }
                    }}
                    placeholder="Введи своё имя"
                    type="text"
                    value={newName}
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => {
                        if (newName.trim()) {
                          setPlayerName(newName.trim())
                          setIsEditingName(false)
                          setNewName('')
                        }
                      }}
                      size="sm"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Сохранить
                    </Button>
                    <Button
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10"
                      onClick={() => {
                        setIsEditingName(false)
                        setNewName('')
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 hover:border-white/10 transition-all"
                  onClick={() => {
                    setIsEditingName(true)
                  }}
                  size="sm"
                >
                  <Edit2 className="w-3 h-3 mr-2" />
                  Изменить ник
                </Button>
              )}

              {/* Список игроков */}
              <div className="space-y-2">
                {players.map((p: Player) => (
                  <div
                    className={`flex items-center justify-between text-sm group rounded-lg px-2 py-1 ${
                      p.isLocal ? 'bg-blue-500/20 border border-blue-500/30' : ''
                    }`}
                    key={p.clientId}
                  >
                    <div
                      className={`flex items-center gap-2 transition-colors ${
                        p.isLocal ? 'text-white' : 'text-white/80 group-hover:text-white'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="truncate max-w-[120px] font-semibold">
                        {p.name}
                        {p.isLocal && <span className="text-white/40 ml-1">(вы)</span>}
                      </span>
                    </div>

                    {p.isReady ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-white/20" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
