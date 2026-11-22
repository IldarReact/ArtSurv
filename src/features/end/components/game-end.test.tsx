/**
 * @vitest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setFinalScore } from '@/core/lib/multiplayer'
import type { GameStore } from '@/core/model/slices/types'
import { useGameStore } from '@/core/model/store'

import { GameEnd } from './game-end'

const multiplayerState = vi.hoisted(() => ({
  active: false,
  players: [] as {
    clientId: string
    color: string
    finalScore: number | null
    gameStarted: boolean
    isHost: boolean
    isLocal: boolean
    isReady: boolean
    name: string
    selectedArchetype: string | null
    turnReady: boolean
  }[],
}))

vi.mock('@/core/model/store', () => ({
  useGameStore: vi.fn(),
}))

vi.mock('@/core/lib/multiplayer', () => ({
  getOnlinePlayers: () => multiplayerState.players,
  isMultiplayerActive: () => multiplayerState.active,
  setFinalScore: vi.fn(),
  subscribeToFinalScoreChanges: vi.fn(() => vi.fn()),
}))

const player = {
  assets: [],
  businesses: [],
  debts: [],
  stats: {
    energy: 100,
    happiness: 100,
    health: 100,
    intelligence: 100,
    money: 0,
    sanity: 100,
  },
}

function onlinePlayer(clientId: string, name: string, finalScore: number | null, isLocal = false) {
  return {
    clientId,
    color: '#ffffff',
    finalScore,
    gameStarted: true,
    isHost: false,
    isLocal,
    isReady: true,
    name,
    selectedArchetype: 'worker',
    turnReady: true,
  }
}

describe('GameEnd', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    multiplayerState.active = false
    multiplayerState.players = []
    vi.mocked(useGameStore).mockReturnValue({
      endReason: 'COMPLETED',
      gameStatus: 'ended',
      history: [],
      lifeEvents: [],
      player,
      turn: 80,
    } as unknown as GameStore)
  })

  it('shows only the detailed score offline and excludes energy', () => {
    render(<GameEnd />)

    expect(screen.queryByRole('region', { name: 'Итоги онлайн-игры' })).toBeNull()
    expect(screen.queryByText('Энергия')).toBeNull()
    expect(screen.getByText('40.0 / 90')).toBeTruthy()
  })

  it('shows online results ranked by final score and keeps unfinished players listed', () => {
    multiplayerState.active = true
    multiplayerState.players = [
      onlinePlayer('local', 'Локальный', null, true),
      onlinePlayer('second', 'Второй', 30),
      onlinePlayer('first', 'Первый', 70),
      onlinePlayer('pending', 'Ожидает игрок', null),
    ]

    render(<GameEnd />)

    expect(setFinalScore).toHaveBeenCalledWith(40)
    const leaderboard = screen.getByRole('region', { name: 'Итоги онлайн-игры' })
    const rows = within(leaderboard).getAllByRole('listitem')

    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Первый'),
      expect.stringContaining('Локальный'),
      expect.stringContaining('Второй'),
      expect.stringContaining('Ожидает игрок'),
    ])
    expect(rows[0].textContent).toContain('1.')
    expect(rows[1].textContent).toContain('2.')
    expect(rows[3].textContent).toContain('Ожидает')
  })
})
