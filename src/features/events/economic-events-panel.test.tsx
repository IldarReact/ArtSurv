/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { GameStore } from '@/core/model/slices/types'
import { useGameStore } from '@/core/model/store'
import type { CountryEconomy, EconomicEvent } from '@/core/types'

import { EconomicEventsPanel } from './economic-events-panel'

vi.mock('@/core/model/store', () => ({
  useGameStore: vi.fn(),
}))

describe('EconomicEventsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders persisted country event history with only current inflation and key rate', () => {
    const event: EconomicEvent = {
      appliedChanges: {
        corporateTaxRate: { delta: -2, from: 24, to: 22 },
        inflation: { delta: 1, from: 2.5, to: 3.5 },
        keyRate: { delta: 0.25, from: 5, to: 5.25 },
      },
      description: 'Изменились налоги и цены.',
      duration: 1,
      effects: {
        corporateTaxRateChange: -2,
        inflationChange: 1,
      },
      id: 'event_1_tax_reform',
      title: 'Налоговая реформа',
      turn: 1,
      type: 'tax_reform',
    }
    const country = {
      activeEvents: [event],
      eventHistory: [event],
      name: 'США',
    } as unknown as CountryEconomy

    vi.mocked(useGameStore).mockReturnValue({
      countries: { us: country },
      player: { countryId: 'us' },
    } as unknown as GameStore)

    render(<EconomicEventsPanel />)

    expect(screen.getByText('События страны: США')).toBeTruthy()
    expect(screen.getByText('Инфляция:')).toBeTruthy()
    expect(screen.getByText('3.50%')).toBeTruthy()
    expect(screen.getByText('Ключевая ставка:')).toBeTruthy()
    expect(screen.getByText('5.25%')).toBeTruthy()
    expect(screen.queryByText('Налог на прибыль бизнеса:')).toBeNull()
    expect(screen.queryByText('2.50%')).toBeNull()
    expect(screen.getAllByText('Налоговая реформа')).toHaveLength(1)
  })

  it('shows a calm country state when there are no events', () => {
    vi.mocked(useGameStore).mockReturnValue({
      countries: { us: { activeEvents: [], eventHistory: [], name: 'США' } },
      player: { countryId: 'us' },
    } as unknown as GameStore)

    render(<EconomicEventsPanel />)

    expect(screen.getByText('В стране всё спокойно...')).toBeTruthy()
  })
})
