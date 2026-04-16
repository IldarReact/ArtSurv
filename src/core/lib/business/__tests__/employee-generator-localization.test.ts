import { describe, it, expect, vi } from 'vitest'

import type * as staticDataLoader from '@/core/lib/data-loaders/static-data-loader'
import type { EmployeeRole } from '@/core/types/business.types'

import { generateEmployeeCandidate, generateCandidates } from '../employee-generator'

// Мокаем зависимости для чистого теста генерации
vi.mock('@/core/lib/data-loaders/static-data-loader', async () => {
  const actual = await vi.importActual<typeof staticDataLoader>(
    '@/core/lib/data-loaders/static-data-loader',
  )
  return {
    ...actual,
    getRandomFirstName: (countryId?: string) => (countryId === 'us' ? 'John' : 'Ivan'),
    getRandomLastName: (countryId?: string) => (countryId === 'us' ? 'Doe' : 'Ivanov'),
  }
})

describe('Employee Generator Localization', () => {
  it('should generate US candidates with US names', () => {
    const role: EmployeeRole = 'worker'
    const candidate = generateEmployeeCandidate(role, 3, undefined, 'us')

    expect(candidate.countryId).toBe('us')
    expect(candidate.name).toBe('John Doe')
  })

  it('should generate default candidates when country is not provided', () => {
    const role: EmployeeRole = 'worker'
    const candidate = generateEmployeeCandidate(role, 3)

    expect(candidate.name).toBe('Ivan Ivanov')
  })

  it('should generate multiple candidates for a specific country', () => {
    const role: EmployeeRole = 'worker'
    const count = 5
    const candidates = generateCandidates(role, count, undefined, 'us')

    expect(candidates).toHaveLength(count)
    candidates.forEach((c) => {
      expect(c.countryId).toBe('us')
      expect(c.name).toBe('John Doe')
    })
  })
})
