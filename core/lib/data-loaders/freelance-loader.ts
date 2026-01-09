// src/shared/data/loaders/freelance-loader.ts
import { FreelanceGigSchema } from '@/core/schemas/game.schema'
import type { FreelanceGig } from '@/core/types/freelance.types'
import brFreelance from '@/shared/data/world/countries/brazil/freelance.json'
import geFreelance from '@/shared/data/world/countries/germany/freelance.json'
import usFreelance from '@/shared/data/world/countries/us/freelance.json'

function loadFreelance(data: unknown[], source: string): FreelanceGig[] {
  return data
    .map((item) => {
      const result = FreelanceGigSchema.safeParse(item)
      if (!result.success) {
        console.error(`Validation failed for freelance gig in ${source}:`, result.error.format())
        return null
      }
      return result.data as FreelanceGig
    })
    .filter((item): item is FreelanceGig => item !== null)
}

const COUNTRY_FREELANCE: Record<string, FreelanceGig[]> = {
  us: loadFreelance(usFreelance, 'us/freelance.json'),
  ge: loadFreelance(geFreelance, 'ge/freelance.json'),
  br: loadFreelance(brFreelance, 'br/freelance.json'),
}

export function getFreelanceGigs(countryId: string = 'us'): FreelanceGig[] {
  return COUNTRY_FREELANCE[countryId] ?? []
}

export function getFreelanceById(id: string, countryId: string = 'us'): FreelanceGig | undefined {
  return getFreelanceGigs(countryId).find((g) => g.id === id)
}

export const ALL_FREELANCE = COUNTRY_FREELANCE.us
