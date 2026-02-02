'use client'

import { AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useMemo } from 'react'

import { getCharactersForCountry } from '@/core/lib/data-loaders/characters-loader'
import { useGameStore } from '@/core/model/store'

import type { ModalView } from '../types'
import { getCharacterImage } from '../utils'
import { CharacterCard } from './character-card'
import { CharacterModal } from './character-modal'

export interface CharacterSelectUIProps {
  onBack?: () => void
  onSelect: (archetype: string) => void
  setupCountryId: string
}

export function CharacterSelectUI({
  onBack,
  onSelect,
  setupCountryId,
}: CharacterSelectUIProps): React.JSX.Element | null {
  const countryId = setupCountryId
  const characters = useMemo(() => getCharactersForCountry(countryId), [countryId])
  const archetypes = useMemo(() => characters.map((c) => c.archetype), [characters])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalView, setModalView] = useState<ModalView>('main')

  const currentArchetype = archetypes[currentIndex]
  const currentCharacter = characters[currentIndex]

  const handleNext = (): void => {
    setCurrentIndex((prev) => (prev + 1) % archetypes.length)
  }

  const handlePrev = (): void => {
    setCurrentIndex((prev) => (prev - 1 + archetypes.length) % archetypes.length)
  }

  const visibleIndices = useMemo(() => {
    const prev = (currentIndex - 1 + archetypes.length) % archetypes.length
    const next = (currentIndex + 1) % archetypes.length
    return [prev, currentIndex, next]
  }, [currentIndex, archetypes.length])

  const handleSelect = (): void => {
    onSelect(currentArchetype)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/90">
      {/* Background with blur */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-md opacity-30 transition-all duration-700"
        style={{ backgroundImage: `url(${getCharacterImage(currentArchetype)})` }}
      />

      {onBack && (
        <button
          className="absolute top-8 left-8 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all text-white"
          onClick={onBack}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Navigation Buttons */}
      <button
        aria-label="Previous character"
        className="absolute left-4 md:left-10 z-20 p-4 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md transition-all text-white/70 hover:text-white"
        onClick={handlePrev}
      >
        <ChevronLeft size={40} />
      </button>

      <button
        aria-label="Next character"
        className="absolute right-4 md:right-10 z-20 p-4 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md transition-all text-white/70 hover:text-white"
        onClick={handleNext}
      >
        <ChevronRight size={40} />
      </button>

      <div className="flex items-center justify-center gap-4 md:gap-8 w-full max-w-7xl h-[80vh] perspective-1000">
        <AnimatePresence initial={false} mode="popLayout">
          {visibleIndices.map((idx, i) => (
            <CharacterCard
              archetype={archetypes[idx]}
              character={characters[idx]}
              countryId={countryId}
              isCenter={i === 1}
              key={`${archetypes[idx]}-${String(idx)}`}
              onDetailsClick={() => {
                setIsModalOpen(true)
              }}
              onSelectClick={handleSelect}
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CharacterModal
            characterName={currentCharacter.name}
            isOpen={isModalOpen}
            modalView={modalView}
            onBack={() => {
              setModalView('main')
            }}
            onClose={() => {
              setIsModalOpen(false)
              setModalView('main')
            }}
            onSelect={() => {
              setIsModalOpen(false)
              handleSelect()
            }}
            setModalView={setModalView}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export function CharacterSelect(): React.JSX.Element | null {
  const { gameStatus, initializeGame, setupCountryId } = useGameStore()

  if (gameStatus !== 'select_character') return null

  return (
    <CharacterSelectUI
      onSelect={(archetype) => {
        if (setupCountryId) {
          initializeGame(setupCountryId, archetype)
        }
      }}
      setupCountryId={setupCountryId ?? 'us'}
    />
  )
}
