import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Zap } from 'lucide-react'
import { useState } from 'react'

import { calculateStatModifiers, getTotalModifier } from '@/core/lib/calculations/stat-modifiers'
import { processLifestyle } from '@/core/model/logic/turns/lifestyle-processor'
import { useGameStore } from '@/core/model/store'

export function HealthIndicator() {
  const { countries, player } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)

  if (!player) return null

  const statMods = calculateStatModifiers(player)
  const healthMod = getTotalModifier(statMods.health, 'health')
  const lifestyleResult = processLifestyle(player, countries)
  const lifestyleHealthMod = lifestyleResult.modifiers.health

  return (
    <div className="relative flex flex-col items-center">
      <button
        className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => {
          setIsOpen(!isOpen)
        }}
      >
        <div className="flex items-center gap-1">
          <span className="text-lg">❤️</span>
          <span className="text-lg font-bold text-white tabular-nums">
            {Math.round(player.stats.health)}
          </span>
        </div>
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Здоровье</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute top-full mt-2 w-72 p-4 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50"
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-xs text-white/90 space-y-3">
              <div className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-lg">❤️</span>
                <span>Факторы здоровья</span>
              </div>
              <div className="space-y-2">
                {statMods.health.map((mod) => {
                  const val = mod.health ?? 0
                  return (
                    <div
                      className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-black/80 hover:bg-black/95 transition-colors"
                      key={`${mod.source}-${String(val)}`}
                    >
                      <span
                        className={
                          val > 0
                            ? 'text-green-500 flex items-center gap-2'
                            : 'text-red-500 flex items-center gap-2'
                        }
                      >
                        {val > 0 ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {mod.source}
                      </span>
                      <span className="text-white font-medium">
                        {val > 0 ? '+' : ''}
                        {val}
                      </span>
                    </div>
                  )
                })}

                {lifestyleHealthMod !== 0 && (
                  <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-black/80 hover:bg-black/95 transition-colors">
                    <span
                      className={
                        lifestyleHealthMod > 0
                          ? 'text-green-500 flex items-center gap-2'
                          : 'text-red-500 flex items-center gap-2'
                      }
                    >
                      {lifestyleHealthMod > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      Образ жизни (еда, жильё, транспорт)
                    </span>
                    <span className="text-white font-medium">
                      {lifestyleHealthMod > 0 ? '+' : ''}
                      {lifestyleHealthMod}
                    </span>
                  </div>
                )}

                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold py-1.5 px-2 rounded-lg bg-black/80">
                    <span className="text-white flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Итого изменение
                    </span>
                    <span
                      className={`text-white text-sm ${healthMod + lifestyleHealthMod >= 0 ? 'text-green-400' : 'text-rose-400'}`}
                    >
                      {healthMod + lifestyleHealthMod > 0 ? '+' : ''}
                      {healthMod + lifestyleHealthMod}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
