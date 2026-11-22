'use client'

import { useGameStore } from '@/core/model/store'
import type { GlobalEvent } from '@/core/types'
import { EconomicEventsPanel } from '@/features/events/economic-events-panel'

export function EventsActivity(): React.JSX.Element | null {
  const { globalEvents, history } = useGameStore()

  return (
    <div className="space-y-6">
      <div className="bg-slate-950/95 rounded-3xl p-8 border border-white/20 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6">События мира</h2>

        <div className="space-y-6">
          <EconomicEventsPanel />

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Глобальные эффекты</h3>
            {globalEvents.length === 0 ? (
              <p className="text-white/70 italic">В мире всё спокойно...</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {globalEvents.map((event: GlobalEvent) => (
                  <div
                    className="bg-indigo-500/20 text-indigo-200 px-4 py-2 rounded-full border border-indigo-500/30"
                    key={event.id || event.title}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">История года</h3>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-white/70 italic">История пока пуста</p>
              ) : (
                history
                  .slice()
                  .reverse()
                  .map((snap) => (
                    <div
                      className="bg-black/60 border border-white/10 p-4 rounded-xl flex justify-between items-center"
                      key={`${String(snap.year)}-${String(snap.turn)}`}
                    >
                      <div>
                        <p className="font-bold text-white">Год {snap.year}</p>
                        <p className="text-sm text-white/80">Ход {snap.turn}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white">Капитал: {snap.netWorth.toLocaleString()}</p>
                        <p className="text-sm text-white/80">
                          Счастье: {Math.round(snap.happiness)}%
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
