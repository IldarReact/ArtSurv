import { describe, expect, it } from 'vitest'

import type { EmployeeRole } from '@/core/types/business.types'
import { TRAITS_MAP } from '@/shared/lib/business/trait-utils'

import { generateCandidates } from '../employee-generator'

describe('Candidate Generation Business Logic', () => {
  const roles: EmployeeRole[] = [
    'worker',
    'salesperson',
    'technician',
    'accountant',
    'marketer',
    'manager',
  ]

  it('should generate candidates with valid traits for all roles', () => {
    roles.forEach((role) => {
      const candidates = generateCandidates(role, 10)
      expect(candidates).toHaveLength(10)

      candidates.forEach((candidate) => {
        expect(candidate.role).toBe(role)
        expect(candidate.humanTraits).toBeDefined()
        expect(Array.isArray(candidate.humanTraits)).toBe(true)

        // All traits must exist in TRAITS_MAP
        candidate.humanTraits.forEach((traitId) => {
          expect(
            TRAITS_MAP[traitId],
            `Generated candidate has unknown trait: ${traitId}`,
          ).toBeDefined()
        })
      })
    })
  })

  it('should generate candidates with consistent name and role data', () => {
    const candidates = generateCandidates('manager', 5)
    candidates.forEach((c) => {
      expect(c.name).toBeTruthy()
      expect(c.role).toBe('manager')
      expect(typeof c.requestedSalary).toBe('number')
      expect(c.requestedSalary).toBeGreaterThan(0)
    })
  })

  it('should have variety in generated traits', () => {
    const candidates = generateCandidates('worker', 50)
    const allGeneratedTraits = candidates.flatMap((c) => c.humanTraits)
    const uniqueTraits = new Set(allGeneratedTraits)

    // With 50 candidates, we should see at least a few different traits if the pool is large enough
    // Our pool has 6 traits now, so we should see most of them
    expect(uniqueTraits.size).toBeGreaterThan(1)
  })
})
