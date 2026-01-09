import { RestActivitySchema } from '@/core/schemas/game.schema'
import type { RestActivity } from '@/core/types/rest.types'
import brRest from '@/shared/data/world/countries/brazil/rest.json'
import geRest from '@/shared/data/world/countries/germany/rest.json'
import usRest from '@/shared/data/world/countries/us/rest.json'

function loadRestActivities(data: unknown[], source: string): RestActivity[] {
  return data
    .map((item) => {
      const result = RestActivitySchema.safeParse(item)
      if (!result.success) {
        console.error(`Invalid rest activity in ${source}:`, item, result.error.format())
        return null
      }
      return result.data as RestActivity
    })
    .filter((item): item is RestActivity => item !== null)
}

const COUNTRY_REST: Record<string, RestActivity[]> = {
  us: loadRestActivities(usRest, 'us/rest.json'),
  germany: loadRestActivities(geRest, 'ge/rest.json'),
  brazil: loadRestActivities(brRest, 'br/rest.json'),
}

export function getRestActivitiesForCountry(countryId: string): RestActivity[] {
  return COUNTRY_REST[countryId] || COUNTRY_REST['us'] || []
}
