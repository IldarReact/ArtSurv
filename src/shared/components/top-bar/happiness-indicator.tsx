import { motion, AnimatePresence } from 'framer-motion'
import { Users } from 'lucide-react'
import { useState } from 'react'

import { calculateStatModifiers, getTotalModifier } from '@/core/lib/calculations/stat-modifiers'
import { processLifestyle } from '@/core/model/logic/turns/lifestyle-processor'
import { useGameStore } from '@/core/model/store'

export function HappinessIndicator() {
  const { countries, player } = useGameStore()
  const [isOpen, setIsOpen] = useState(false)

  if (!player) return null

  const statMods = calculateStatModifiers(player)
  const happinessMod = getTotalModifier(statMods.happiness, 'happiness')
  const lifestyleResult = processLifestyle(player, countries)
  const lifestyleHappinessMod = lifestyleResult.modifiers.happiness

  return (
    <div className="relative flex flex-col items-center">
      <button
        className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => {
          setIsOpen(!isOpen)
        }}
      >
        <div className="flex items-center gap-1">
          <span className="text-lg">😊</span>
          <span className="text-lg font-bold text-white tabular-nums">
            {Math.round(player.stats.happiness)}
          </span>
        </div>
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">Счастье</span>
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
                <span className="text-lg">😊</span>
                <span>Факторы счастья</span>
              </div>
              <div className="space-y-2">
                {statMods.happiness.length === 0 ? (
                  <div className="text-white/50 italic px-2">Нет активных факторов</div>
                ) : (
                  statMods.happiness.map((mod) => {
                    const val = mod.happiness ?? 0
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
                          <Users className="w-3.5 h-3.5" />
                          {mod.source}
                        </span>
                        <span className="text-white/70 font-medium">
                          {val > 0 ? '+' : ''}
                          {val}
                        </span>
                      </div>
                    )
                  })
                )}

                {lifestyleHappinessMod !== 0 && (
                  <div className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-black/80 hover:bg-black/95 transition-colors">
                    <span
                      className={
                        lifestyleHappinessMod > 0
                          ? 'text-green-500 flex items-center gap-2'
                          : 'text-red-500 flex items-center gap-2'
                      }
                    >
                      Образ жизни (еда, жильё, транспорт)
                    </span>
                    <span className="text-white font-medium">
                      {lifestyleHappinessMod > 0 ? '+' : ''}
                      {lifestyleHappinessMod}
                    </span>
                  </div>
                )}

                <div className="border-t border-white/20 pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold py-1.5 px-2 rounded-lg bg-black/80">
                    <span className="text-white flex items-center gap-2">Итого изменение</span>
                    <span
                      className={`text-white text-sm ${happinessMod + lifestyleHappinessMod >= 0 ? 'text-green-400' : 'text-rose-400'}`}
                    >
                      {happinessMod + lifestyleHappinessMod > 0 ? '+' : ''}
                      {happinessMod + lifestyleHappinessMod}
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
