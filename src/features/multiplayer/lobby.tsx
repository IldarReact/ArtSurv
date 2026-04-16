'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { getCharactersForCountry } from '@/core/lib/data-loaders/characters-loader'
import {
  getOnlinePlayers,
  setSelectedArchetype,
  startGame,
  subscribeToGameStart,
  isHost,
  initMultiplayer,
  setPlayerReady,
} from '@/core/lib/multiplayer'
import { useGameStore } from '@/core/model/store'
import type { CountryEconomy } from '@/core/types'
import { CharacterSelectUI } from '@/src/features/setup/components/character-select'
import { WorldSelectUI } from '@/src/features/setup/components/world-select'

import { LobbyFooterActions } from './components/lobby/lobby-footer-actions'
import { LobbyHeader } from './components/lobby/lobby-header'
import { LobbyInfoBlock } from './components/lobby/lobby-info-block'
import { LobbySettings } from './components/lobby/lobby-settings'
import { PlayerList } from './components/lobby/player-list'
import type { Player } from './multiplayer-hub'

export function MultiplayerLobby() {
  const router = useRouter()
  const { countries, initializeGame } = useGameStore()
  const countryList: CountryEconomy[] = Object.values(countries)

  const [players, setPlayers] = useState<Player[]>([])
  const [selectedArchetype, setSelectedArchetypeLocal] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>('us')
  const [isReady, setIsReady] = useState(false)

  const roomId = React.useMemo(() => {
    if (typeof window === 'undefined') return ''
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('room') ?? ''
  }, [])

  const characters = getCharactersForCountry(selectedCountry)

  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false)
  const [isArchetypeModalOpen, setIsArchetypeModalOpen] = useState(false)

  useEffect(() => {
    if (!roomId) {
      router.push('/')
      return
    }

    const isStoredHost =
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem(`life_sim_host_${roomId}`) === 'true'
    initMultiplayer(roomId, isStoredHost)

    const updatePlayerHost = () => {
      const currentPlayers = getOnlinePlayers()
      setPlayers(currentPlayers)
    }

    const interval = setInterval(updatePlayerHost, 6000)
    updatePlayerHost()

    const unsubscribeGameStart = subscribeToGameStart(() => {
      if (isHost()) return

      const myPlayer = getOnlinePlayers().find((p) => p.isLocal)
      if (myPlayer?.selectedArchetype) {
        initializeGame(selectedCountry, myPlayer.selectedArchetype)
        router.push('/')
      }
    })

    return () => {
      clearInterval(interval)
      unsubscribeGameStart()
    }
  }, [initializeGame, router, selectedCountry, roomId])

  const handleArchetypeSelect = (archetype: string) => {
    setSelectedArchetypeLocal(archetype)
    setSelectedArchetype(archetype)
    setIsArchetypeModalOpen(false)
  }

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId)
    setIsCountryModalOpen(false)
  }

  const handleToggleReady = () => {
    const newReadyState = !isReady
    setIsReady(newReadyState)
    setPlayerReady(newReadyState)
  }

  const handleStartGame = () => {
    const allReady = players.every((p) => p.isReady && p.selectedArchetype)
    if (!allReady) {
      if (typeof window !== 'undefined') {
        window.alert("Не все готовы! Все игроки должны выбрать персонажа и нажать 'Готов'.")
      }
      return
    }

    startGame()

    const myPlayer = players.find((p) => p.isLocal)
    if (myPlayer?.selectedArchetype) {
      initializeGame(selectedCountry, myPlayer.selectedArchetype)
      router.push('/')
    }
  }

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      void window.navigator.clipboard.writeText(window.location.href)
      window.alert('Ссылка скопирована!')
    }
  }

  const canStart =
    isHost() && players.every((p) => p.isReady && p.selectedArchetype) && players.length > 0
  const canReady = selectedArchetype !== null

  const selectedCountryName =
    countryList.find((c) => c.id === selectedCountry)?.name ?? 'Не выбрано'
  const selectedArchetypeName =
    characters.find((c) => c.archetype === selectedArchetype)?.name ?? 'Не выбрано'

  if (isCountryModalOpen) {
    return (
      <WorldSelectUI
        countries={countryList}
        onBack={() => {
          setIsCountryModalOpen(false)
        }}
        onSelect={handleCountrySelect}
      />
    )
  }

  if (isArchetypeModalOpen) {
    return (
      <CharacterSelectUI
        onBack={() => {
          setIsArchetypeModalOpen(false)
        }}
        onSelect={handleArchetypeSelect}
        setupCountryId={selectedCountry}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-200 font-sans">
      <div className="max-w-7xl mx-auto">
        <LobbyHeader onCopyLink={copyLink} roomId={roomId} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <PlayerList players={players} />
            <LobbyFooterActions
              canReady={canReady}
              canStart={canStart}
              isReady={isReady}
              onStartGame={handleStartGame}
              onToggleReady={handleToggleReady}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <LobbySettings
              onOpenArchetypeModal={() => {
                setIsArchetypeModalOpen(true)
              }}
              onOpenCountryModal={() => {
                setIsCountryModalOpen(true)
              }}
              selectedArchetype={selectedArchetype}
              selectedArchetypeName={selectedArchetypeName}
              selectedCountryName={selectedCountryName}
            />
            <LobbyInfoBlock />
          </div>
        </div>
      </div>
    </div>
  )
}
