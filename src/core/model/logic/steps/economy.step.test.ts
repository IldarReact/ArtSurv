import { describe, expect, it, vi } from 'vitest'

import type { CountryEconomy, EconomicEvent } from '@/core/types'

import { processCountryEconomy } from '../economy/country-economy-processor'
import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'
import { economyStep } from './economy.step'

vi.mock('../economy/country-economy-processor', () => ({
  processCountryEconomy: vi.fn(),
}))

describe('economyStep', () => {
  it('writes country events and reports only current inflation and key rate in notifications', () => {
    const previousCountry = {
      activeEvents: [],
      id: 'us',
      name: 'США',
    } as unknown as CountryEconomy
    const event: EconomicEvent = {
      appliedChanges: {
        inflation: { delta: 1.25, from: 2.5, to: 3.75 },
        keyRate: { delta: 0.5, from: 5, to: 5.5 },
        personalTaxRate: { delta: -1, from: 24, to: 23 },
      },
      description: 'Произошла налоговая реформа.',
      duration: 1,
      effects: {
        inflationChange: 1.25,
        personalTaxRateChange: -1,
      },
      id: 'event_1_tax_reform',
      title: 'Налоговая реформа',
      turn: 1,
      type: 'tax_reform',
    }
    const nextCountry = {
      ...previousCountry,
      activeEvents: [event],
      eventHistory: [event],
      inflation: 3.75,
      keyRate: 5.5,
      taxRate: 23,
    }
    vi.mocked(processCountryEconomy).mockReturnValueOnce({
      country: nextCountry as CountryEconomy,
      event,
    })
    const state = {
      countries: { us: previousCountry },
      country: previousCountry,
      globalMarketValue: 1,
      inflationNotification: null,
      notifications: [],
    } as unknown as TurnState
    const context = { turn: 1, year: 2024 } as TurnContext

    economyStep(context, state)

    expect(state.countries.us).toBe(nextCountry)
    expect(state.country).toBe(nextCountry)
    expect(state.notifications[0].message).toContain('Инфляция: 3.75%')
    expect(state.notifications[0].message).toContain('Ключевая ставка: 5.50%')
    expect(state.notifications[0].message).not.toContain('Личный налог')
  })
})
