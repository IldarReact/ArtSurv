import { CharacterDataSchema } from '@/core/schemas/game.schema'
import type { CharacterData } from '@/core/types/character.types'

// Country imports
import brCharacters from '@/shared/data/world/countries/brazil/characters.json'
import geCharacters from '@/shared/data/world/countries/germany/characters.json'
import usCharacters from '@/shared/data/world/countries/us/characters.json'

function loadCharacters(data: unknown[], source: string): CharacterData[] {
  return data
    .map((item) => {
      const result = CharacterDataSchema.safeParse(item)
      if (!result.success) {
        console.error(`Invalid character in ${source}:`, item, result.error.format())
        return null
      }
      return result.data as CharacterData
    })
    .filter((item): item is CharacterData => item !== null)
}

const COUNTRY_CHARACTERS: Record<string, CharacterData[]> = {
  us: loadCharacters(usCharacters, 'us/characters.json'),
  germany: loadCharacters(geCharacters, 'germany/characters.json'),
  brazil: loadCharacters(brCharacters, 'brazil/characters.json'),
}

/**
 * Get all characters for a specific country
 */
export function getCharactersForCountry(countryId: string): CharacterData[] {
  return COUNTRY_CHARACTERS[countryId] ?? COUNTRY_CHARACTERS.us
}

/**
 * Get character by archetype for a specific country
 */
export function getCharacterByArchetype(
  archetype: string,
  countryId: string = 'us',
): CharacterData | undefined {
  const characters = getCharactersForCountry(countryId)
  return characters.find((char) => char.archetype === archetype)
}

/**
 * Get character by ID
 */
export function getCharacterById(id: string, countryId: string = 'us'): CharacterData | undefined {
  const characters = getCharactersForCountry(countryId)
  return characters.find((char) => char.id === id)
}
