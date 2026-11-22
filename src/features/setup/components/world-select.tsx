'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

import { isCountryAvailable } from '@/core/lib/data-loaders/economy-loader'
import { useGameStore } from '@/core/model/store'
import type { CountryEconomy } from '@/core/types'
import { Button } from '@/shared/components/button'

export interface WorldSelectUIProps {
  countries: CountryEconomy[]
  onBack?: () => void
  onSelect: (countryId: string) => void
}

export function WorldSelectUI({
  countries,
  onBack,
  onSelect,
}: WorldSelectUIProps): React.JSX.Element | null {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (countries.length === 0) return

    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % countries.length)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + countries.length) % countries.length)
      if (e.key === 'Escape' && onBack) onBack()
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [countries.length, onBack])

  if (countries.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-white text-2xl">Загрузка стран...</div>
      </div>
    )
  }

  const country = countries[index]
  const bg =
    country.imageUrl ??
    'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=2000&h=1200&fit=crop'

  const next = (): void => {
    setIndex((i) => (i + 1) % countries.length)
  }
  const prev = (): void => {
    setIndex((i) => (i - 1 + countries.length) % countries.length)
  }

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-cover bg-center"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key={bg + String(index)}
          style={{ backgroundImage: `url(${bg})` }}
          transition={{ duration: 0.7 }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {onBack && (
        <button
          className="absolute top-8 left-8 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all text-white"
          onClick={onBack}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      <div className="relative h-screen flex items-center justify-end px-10 lg:px-20">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-2xl bg-slate-950/90 rounded-3xl border border-white/20 p-12 shadow-2xl"
          initial={{ opacity: 0, x: 400 }}
          key={index}
          transition={{ stiffness: 80, type: 'spring' }}
        >
          <div className="space-y-10">
            <div className="text-right">
              <h1 className="text-7xl font-black text-white tracking-tight">{country.name}</h1>
            </div>

            <div className="flex justify-end pt-8">
              <Button
                className="bg-white text-black hover:bg-white/90 font-bold text-xl px-16 py-8 rounded-2xl shadow-2xl transition-all hover:scale-105"
                onClick={() => {
                  onSelect(country.id)
                }}
                size="lg"
              >
                Продолжить
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {countries.length > 1 && (
        <>
          <button
            aria-label="Previous country"
            className="absolute left-8 top-1/2 -translate-y-1/2 z-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all flex items-center justify-center"
            onClick={prev}
          >
            <ChevronLeft className="w-12 h-12 text-white/50 hover:text-white" />
          </button>
          <button
            aria-label="Next country"
            className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all flex items-center justify-center"
            onClick={next}
          >
            <ChevronRight className="w-12 h-12 text-white/50 hover:text-white" />
          </button>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-10">
            {countries.map((c, i) => (
              <button
                className={`transition-all rounded-full ${i === index ? 'w-14 h-3 bg-white' : 'w-3 h-3 bg-white/50 hover:bg-white/80'}`}
                key={c.id}
                onClick={() => {
                  setIndex(i)
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function WorldSelect(): React.JSX.Element | null {
  const { countries: countriesRecord, gameStatus, setSetupCountry } = useGameStore()

  if (gameStatus !== 'setup') {
    return null
  }

  const availableCountries = Object.values(countriesRecord).filter((country) =>
    isCountryAvailable(country.id),
  )

  return <WorldSelectUI countries={availableCountries} onSelect={setSetupCountry} />
}
