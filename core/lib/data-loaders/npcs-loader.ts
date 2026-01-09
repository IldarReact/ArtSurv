// src/shared/data/loaders/npcs-loader.ts
import { FamilyMemberSchema } from '@/core/schemas/family.schema'
import type { FamilyMember } from '@/core/types/family.types'
import brNpcs from '@/shared/data/world/countries/brazil/npcs.json'
import geNpcs from '@/shared/data/world/countries/germany/npcs.json'
import usNpcs from '@/shared/data/world/countries/us/npcs.json'

function loadNpcs(data: unknown[], source: string): FamilyMember[] {
  return data
    .map((item) => {
      const result = FamilyMemberSchema.safeParse(item)
      if (!result.success) {
        console.error(`Invalid NPC in ${source}:`, item, result.error.format())
        return null
      }
      return result.data as FamilyMember
    })
    .filter((item): item is FamilyMember => item !== null)
}

const COUNTRY_NPCS: Record<string, FamilyMember[]> = {
  br: loadNpcs(brNpcs, 'brazil/npcs.json'),
  ge: loadNpcs(geNpcs, 'germany/npcs.json'),
  us: loadNpcs(usNpcs, 'us/npcs.json'),
}

export function getAllNPCs(countryId: string): FamilyMember[] {
  return COUNTRY_NPCS[countryId] ?? []
}

export function getNPCsByType(countryId: string, type: FamilyMember['type']): FamilyMember[] {
  return getAllNPCs(countryId).filter((npc) => npc.type === type)
}

export function getNPCById(id: string, countryId: string): FamilyMember | undefined {
  return getAllNPCs(countryId).find((npc) => npc.id === id)
}

// Удобные хелперы
export function getFamily(countryId: string): FamilyMember[] {
  return getAllNPCs(countryId).filter((n) =>
    ['wife', 'husband', 'child', 'parent'].includes(n.type),
  )
}

// export function getFriends(countryId: string): FamilyMember[] {
//   return getNPCsByType(countryId, 'friend')
// }

export function getPets(countryId: string): FamilyMember[] {
  return getNPCsByType(countryId, 'pet')
}
