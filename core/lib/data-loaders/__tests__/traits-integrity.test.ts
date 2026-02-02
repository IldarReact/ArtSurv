import { describe, expect, it } from 'vitest'

import employeeData from '@/shared/data/employees/employee-data.json'
import humanTraitsData from '@/shared/data/world/commons/human-traits.json'
import { TRAITS_MAP } from '@/shared/lib/business/trait-utils'

describe('Traits Data Integrity', () => {
  it('should have all employee traits defined in human-traits.json', () => {
    const employeeTraits = employeeData.humanTraits
    const definedTraitIds = humanTraitsData.map((t) => t.id)

    employeeTraits.forEach((traitId) => {
      expect(
        definedTraitIds,
        `Trait "${traitId}" from employee-data.json is missing in human-traits.json`,
      ).toContain(traitId)
    })
  })

  it('should have consistent TRAITS_MAP with human-traits.json', () => {
    const definedTraitIds = humanTraitsData.map((t) => t.id)
    const mapTraitIds = Object.keys(TRAITS_MAP)

    expect(mapTraitIds).toHaveLength(definedTraitIds.length)
    definedTraitIds.forEach((id) => {
      expect(mapTraitIds).toContain(id)
    })
  })

  it('should have all traits in human-traits.json valid according to required properties', () => {
    humanTraitsData.forEach((trait) => {
      expect(trait.id).toBeDefined()
      expect(trait.name).toBeDefined()
      expect(trait.description).toBeDefined()
      expect(trait.type).toBeDefined()
      expect(['positive', 'negative', 'neutral', 'medical']).toContain(trait.type)
    })
  })
})
