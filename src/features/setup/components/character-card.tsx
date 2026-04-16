import { motion } from 'framer-motion'

import { getJobById } from '@/core/lib/data-loaders/jobs-loader'
import type { CharacterData } from '@/core/types/character.types'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/utils/utils'

import { getCharacterImage, calculateQuarterlySalary } from '../utils'

interface CharacterCardProps {
  archetype: string
  character: CharacterData
  countryId: string
  isCenter: boolean
  onDetailsClick: () => void
  onSelectClick: () => void
}

export function CharacterCard({
  archetype,
  character,
  countryId,
  isCenter,
  onDetailsClick,
  onSelectClick,
}: CharacterCardProps) {
  return (
    <motion.div
      animate={{
        filter: isCenter ? 'blur(0px)' : 'blur(4px) brightness(0.6)',
        opacity: isCenter ? 1 : 0.4,
        scale: isCenter ? 1 : 0.85,
        x: 0,
        zIndex: isCenter ? 10 : 1,
      }}
      className={cn(
        'relative h-[70vh] aspect-2/3 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500',
        'border border-white/10 bg-black/40 backdrop-blur-sm',
      )}
      exit={{ opacity: 0, scale: 0.8 }}
      initial={{ opacity: 0, scale: 0.8 }}
      key={`${archetype}-${character.id}`}
      layoutId={archetype}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={archetype}
          className="w-full h-full object-cover"
          src={getCharacterImage(archetype)}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-90" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 text-white">
        <div className="text-center mt-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-2 uppercase tracking-wide drop-shadow-lg">
            {character.name}
          </h2>
        </div>

        <div className="flex flex-col gap-4 items-center mb-4">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 w-full border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-lg">
              <span className="text-white/70">Доход:</span>
              <span className="font-bold text-green-400">
                $
                {(() => {
                  if (character.startingJobId) {
                    const job = getJobById(character.startingJobId, countryId)
                    if (job) return calculateQuarterlySalary(job.salary).toLocaleString()
                  }
                  return calculateQuarterlySalary(character.startingSalary ?? 0).toLocaleString()
                })()}
                /кв
              </span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-white/70">Капитал:</span>
              <span
                className={cn(
                  'font-bold',
                  character.startingMoney >= 0 ? 'text-white' : 'text-red-400',
                )}
              >
                ${character.startingMoney.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-white/70">Счастье:</span>
              <span className="font-bold text-yellow-400">{character.startingStats.happiness}</span>
            </div>
          </div>

          {isCenter && (
            <div className="flex flex-col gap-3 w-full mt-2">
              <Button
                className="w-full bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm h-14 text-lg font-medium rounded-xl"
                onClick={onDetailsClick}
                size="lg"
                variant="outline"
              >
                Подробнее...
              </Button>
              <Button
                className="w-full bg-white text-black hover:bg-white/90 h-14 text-xl font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                onClick={onSelectClick}
                size="lg"
              >
                Выбрать
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
