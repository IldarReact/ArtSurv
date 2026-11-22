'use client'

import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Landmark,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'

import { useGameStore } from '@/core/model/store'
import type { EconomicEvent } from '@/core/types'
import { Badge } from '@/shared/components/badge'
import { Card } from '@/shared/components/card'

const eventIcons: Record<EconomicEvent['type'], React.ReactNode> = {
  boom: <TrendingUp className="w-5 h-5 text-emerald-400" />,
  crisis: <AlertTriangle className="w-5 h-5 text-red-400" />,
  inflation_spike: <Zap className="w-5 h-5 text-yellow-400" />,
  rate_cut: <ArrowDown className="w-5 h-5 text-cyan-400" />,
  rate_hike: <ArrowUp className="w-5 h-5 text-blue-400" />,
  recession: <TrendingDown className="w-5 h-5 text-orange-400" />,
  tax_reform: <Landmark className="w-5 h-5 text-violet-400" />,
}

const eventColors: Record<EconomicEvent['type'], string> = {
  boom: 'bg-slate-950/95 border-emerald-500/50',
  crisis: 'bg-slate-950/95 border-red-500/50',
  inflation_spike: 'bg-slate-950/95 border-yellow-500/50',
  rate_cut: 'bg-slate-950/95 border-cyan-500/50',
  rate_hike: 'bg-slate-950/95 border-blue-500/50',
  recession: 'bg-slate-950/95 border-orange-500/50',
  tax_reform: 'bg-slate-950/95 border-violet-500/50',
}

const visibleMetrics = [
  { key: 'inflation', label: 'Инфляция' },
  { key: 'keyRate', label: 'Ключевая ставка' },
] as const

export function EconomicEventsPanel() {
  const { countries, player } = useGameStore()

  if (!player) return null

  const country = countries[player.countryId]

  const activeEventIds = new Set(country.activeEvents.map((event) => event.id))
  const eventsById = new Map(
    (country.eventHistory ?? []).map((event) => [event.id, event] as const),
  )
  for (const event of country.activeEvents) {
    eventsById.set(event.id, event)
  }
  const events = [...eventsById.values()].reverse()

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-white/70" />
        <h3 className="text-xl font-semibold text-white/80">События страны: {country.name}</h3>
      </div>

      {events.length === 0 ? (
        <p className="text-white/70 italic">
          За этот период нет событий с фактическими изменениями.
        </p>
      ) : (
        events.map((event) => (
          <Card className={`p-4 border ${eventColors[event.type]}`} key={event.id}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-black/50">{eventIcons[event.type]}</div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-white">{event.title}</h4>
                  <Badge className="text-xs border-white/30 text-white/80" variant="outline">
                    {activeEventIds.has(event.id) ? 'Сейчас' : `Ход ${String(event.turn)}`}
                  </Badge>
                </div>

                <p className="text-sm text-white/90 mb-3">{event.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {visibleMetrics.map(({ key, label }) => {
                    const change = event.appliedChanges?.[key]
                    if (!change) return null

                    return (
                      <div className="flex flex-wrap gap-1" key={key}>
                        <span className="text-white/70">{label}:</span>
                        <span className="font-semibold text-white">{change.to.toFixed(2)}%</span>
                      </div>
                    )
                  })}
                  {!visibleMetrics.some((metric) => event.appliedChanges?.[metric.key]) && (
                    <span className="text-white/70">Инфляция и ключевая ставка не изменились.</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </section>
  )
}
