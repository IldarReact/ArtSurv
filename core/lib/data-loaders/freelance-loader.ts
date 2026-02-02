// src/shared/data/loaders/freelance-loader.ts
import { FreelanceGigSchema } from '@/core/schemas/game.schema'
import type { FreelanceGig } from '@/core/types/freelance.types'
import brFreelance from '@/shared/data/world/countries/brazil/freelance.json'
import geFreelance from '@/shared/data/world/countries/germany/freelance.json'
import usFreelance from '@/shared/data/world/countries/us/freelance.json'

function loadFreelance(data: unknown[], _source: string): FreelanceGig[] {
  return data
    .map((item) => {
      const result = FreelanceGigSchema.safeParse(item)
      if (!result.success) {
        // eslint-disable-next-line no-console
        console.error(
          `Invalid freelance gig in ${_source}:`,
          (item as { id?: string }).id ?? 'unknown',
          result.error.format(),
        )
        return null
      }
      return result.data as FreelanceGig
    })
    .filter((item): item is FreelanceGig => item !== null)
}

const COUNTRY_FREELANCE: Record<string, FreelanceGig[]> = {
  br: loadFreelance(brFreelance, 'br/freelance.json'),
  ge: loadFreelance(geFreelance, 'ge/freelance.json'),
  us: loadFreelance(usFreelance, 'us/freelance.json'),
}

export function getFreelanceGigs(countryId = 'us'): FreelanceGig[] {
  return COUNTRY_FREELANCE[countryId] ?? []
}

export function getFreelanceById(id: string, countryId = 'us'): FreelanceGig | undefined {
  return getFreelanceGigs(countryId).find((g) => g.id === id)
}

export const ALL_FREELANCE = COUNTRY_FREELANCE.us
