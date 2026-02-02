import { describe, expect, it } from 'vitest'

import { getAllBusinessTypesForCountry } from '../businesses-loader'
import { getFreelanceGigs } from '../freelance-loader'
import { getHousingForCountry } from '../housing-loader'
import { getAllJobsForCountry } from '../jobs-loader'

describe('Data Integrity Verification', () => {
  const fullCountryNames = ['us', 'germany', 'brazil']
  const shortCountryNames = ['us', 'ge', 'br']

  describe('Business Templates', () => {
    fullCountryNames.forEach((country) => {
      it(`should validate all business types for ${country}`, () => {
        const data = getAllBusinessTypesForCountry(country)
        expect(data.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Jobs Data', () => {
    fullCountryNames.forEach((country) => {
      it(`should validate all jobs for ${country}`, () => {
        const data = getAllJobsForCountry(country)
        expect(data.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Freelance Gigs', () => {
    shortCountryNames.forEach((country) => {
      it(`should validate all freelance gigs for ${country}`, () => {
        const data = getFreelanceGigs(country)
        expect(data.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Housing Options', () => {
    fullCountryNames.forEach((country) => {
      it(`should validate all housing options for ${country}`, () => {
        const data = getHousingForCountry(country)
        expect(data.length).toBeGreaterThan(0)
      })
    })
  })
})
