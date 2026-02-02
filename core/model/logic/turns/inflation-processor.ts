import {
  shouldApplyInflationThisTurn,
  generateYearlyInflation,
  calculateKeyRate,
  formatInflationNotification,
  type InflationNotification,
} from '@/core/lib/calculations/inflation-engine'
import { getQuarter } from '@/core/lib/quarter'
import type { CountryEconomy } from '@/core/types'
import type { Notification } from '@/core/types'

import { devLog } from '../../../lib/debug'

/**
 * Process yearly inflation for the player's country when appropriate.
 * Returns possibly-updated countries map and a ready-to-push notification.
 */
export function processInflation(
  countries: Record<string, CountryEconomy>,
  playerCountryId: string,
  newTurn: number,
  newYear: number,
): {
  updatedCountries: Record<string, CountryEconomy>
  inflationNotification: InflationNotification | null
  notification?: Notification
} {
  let updatedCountries = countries
  let inflationNotification: InflationNotification | null = null

  const country = countries[playerCountryId]

  if (!shouldApplyInflationThisTurn(newTurn)) return { inflationNotification, updatedCountries }

  const newInflation = generateYearlyInflation(country.inflation, country)
  const newKeyRate = calculateKeyRate(newInflation, country.keyRate)
  const inflationChange = newInflation - country.inflation
  const keyRateChange = newKeyRate - country.keyRate

  const MAX_HISTORY_LENGTH = 10
  const HISTORY_SLICE_INDEX = MAX_HISTORY_LENGTH - 1
  const newInflationHistory = [
    newInflation,
    ...(country.inflationHistory ?? []).slice(0, HISTORY_SLICE_INDEX),
  ]

  devLog('[INFLATION UPDATE] Turn', newTurn, `${String(getQuarter(newTurn))}, Year`, newYear, {
    change: inflationChange,
    newHistory: newInflationHistory,
    newInflation,
    oldHistory: country.inflationHistory,
    oldInflation: country.inflation,
  })

  updatedCountries = {
    ...countries,
    [playerCountryId]: {
      ...country,
      inflation: newInflation,
      inflationHistory: newInflationHistory,
      keyRate: newKeyRate,
    },
  }

  inflationNotification = {
    countryName: country.name,
    inflationChange,
    inflationRate: newInflation,
    keyRate: newKeyRate,
    keyRateChange,
    timestamp: newTurn,
    year: newYear,
  }

  const notification: Notification = {
    date: `${String(newYear)} Q1`,
    id: `inflation_${String(newTurn)}`,
    isRead: false,
    message: formatInflationNotification(inflationNotification),
    title: `📊 Экономика: Инфляция в ${country.name}`,
    type: 'info',
  }

  return { inflationNotification, notification, updatedCountries }
}
