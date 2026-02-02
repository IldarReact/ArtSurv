import { CourseSchema } from '@/core/schemas/game.schema'
// Country imports
import brCourses from '@/shared/data/world/countries/brazil/courses.json'
import geCourses from '@/shared/data/world/countries/germany/courses.json'
import usCourses from '@/shared/data/world/countries/us/courses.json'

export interface Course {
  cost: number
  costPerTurn?: {
    energy?: number
    sanity?: number
  }
  description?: string
  duration: number
  id: string
  name: string
  requirements?: {
    education?: string
    skills?: { name: string; level: number }[]
  }
  skillGain: number
  skillName: string
}

function loadCourses(data: unknown[], source: string): Course[] {
  return data.map((item) => {
    const result = CourseSchema.safeParse(item)
    if (!result.success) {
      // console.error(`Invalid course in ${source}:`, item, result.error.format())
      throw new Error(`Course data validation failed for ${source}`)
    }
    return result.data as Course
  })
}

// Country Data Registry
const COUNTRY_COURSES: Record<string, Course[] | undefined> = {
  br: loadCourses(brCourses, 'br/courses.json'),
  ge: loadCourses(geCourses, 'ge/courses.json'),
  us: loadCourses(usCourses, 'us/courses.json'),
}

// Get courses for specific country
function getCountryCourses(countryId: string): Course[] {
  const courses = COUNTRY_COURSES[countryId]
  if (!courses) {
    // console.error(`No courses data found for country: ${countryId}`)
    return []
  }
  return courses
}

// Export for backward compatibility (defaults to US)
export const ALL_COURSES = COUNTRY_COURSES.us ?? []

export function getCourseById(id: string, countryId = 'us'): Course | undefined {
  const courses = getCountryCourses(countryId)
  return courses.find((c) => c.id === id)
}

export function getCoursesBySkill(skillName: string, countryId = 'us'): Course[] {
  const courses = getCountryCourses(countryId)
  return courses.filter((c) => c.skillName === skillName)
}

export function getAllCoursesForCountry(countryId: string): Course[] {
  return getCountryCourses(countryId)
}
