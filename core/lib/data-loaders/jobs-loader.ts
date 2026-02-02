import { JobSchema } from '@/core/schemas/game.schema'
import type { Job } from '@/core/types/job.types'
// Country imports
import brJobs from '@/shared/data/world/countries/brazil/jobs.json'
import geJobs from '@/shared/data/world/countries/germany/jobs.json'
import usJobs from '@/shared/data/world/countries/us/jobs.json'

function loadJobs(data: unknown[], source: string): Job[] {
  const validated: Job[] = []

  for (const item of data) {
    const result = JobSchema.safeParse(item)
    if (result.success) {
      validated.push(result.data as Job)
    } else {
      // eslint-disable-next-line no-console
      console.error(
        `Invalid job in ${source}:`,
        (item as { id?: string }).id ?? 'unknown',
        result.error.format(),
      )
      throw new Error(`Job data validation failed for ${source}. Check console for details.`)
    }
  }

  return validated
}

// Country Data Registry
const COUNTRY_JOBS: Record<string, Job[] | undefined> = {
  brazil: loadJobs(brJobs, 'brazil/jobs.json'),
  germany: loadJobs(geJobs, 'germany/jobs.json'),
  us: loadJobs(usJobs, 'us/jobs.json'),
}

// Get jobs for specific country
function getCountryJobs(countryId: string): Job[] {
  const jobs = COUNTRY_JOBS[countryId]
  if (!jobs) {
    // console.error(`No jobs data found for country: ${countryId}`)
    return []
  }
  return jobs
}

// Export for backward compatibility (defaults to US)
export const ALL_JOBS = COUNTRY_JOBS.us ?? []

export function getJobById(id: string, countryId = 'us'): Job | undefined {
  const jobs = getCountryJobs(countryId)
  return jobs.find((j) => j.id === id)
}

export function getJobsByCategory(category: string, countryId = 'us'): Job[] {
  const jobs = getCountryJobs(countryId)
  return jobs.filter((j) => j.category === category)
}

export function getAllJobsForCountry(countryId: string): Job[] {
  return getCountryJobs(countryId)
}

/**
 * Получить подходящую стартовую вакансию для персонажа
 * Выбирает вакансию без требований или с минимальными требованиями
 */
export function getStartingJob(
  countryId: string,
  _characterSkills: { id: string; level: number }[] = [],
): Job | null {
  const jobs = getCountryJobs(countryId)

  if (jobs.length === 0) {
    // console.error(`No jobs available for country: ${countryId}`)
    return null
  }

  // Сначала ищем вакансии без требований
  const noRequirementsJobs = jobs.filter(
    (j) =>
      !j.requirements ||
      ((!j.requirements.skills || j.requirements.skills.length === 0) &&
        !j.requirements.education &&
        (!j.requirements.experience || j.requirements.experience === 0)),
  )

  if (noRequirementsJobs.length > 0) {
    // Возвращаем первую вакансию без требований
    return noRequirementsJobs[0]
  }

  // Если нет вакансий без требований, ищем с минимальными требованиями (level 1)
  const minRequirementsJobs = jobs.filter((j) => {
    if (!j.requirements?.skills) return false
    return j.requirements.skills.every((req) => req.level <= 1)
  })

  if (minRequirementsJobs.length > 0) {
    return minRequirementsJobs[0]
  }

  // В крайнем случае возвращаем первую доступную вакансию
  return jobs[0]
}
