import { SkillDefinitionSchema } from '@/core/schemas/game.schema'
import type { SkillDefinition } from '@/core/types/skill.types'
import skillsData from '@/shared/data/world/commons/skills.json'

export const ALL_SKILLS: SkillDefinition[] = (skillsData as unknown[]).map((item, index) => {
  const result = SkillDefinitionSchema.safeParse(item)
  if (result.success) {
    return result.data as SkillDefinition
  } else {
    console.error(`Invalid skill at index ${index}:`, item, result.error.format())
    throw new Error(`Skill data validation failed`)
  }
})

export function getSkillById(id: string): SkillDefinition | undefined {
  return ALL_SKILLS.find((s) => s.id === id)
}

export function getSkillsByCategory(category: string): SkillDefinition[] {
  return ALL_SKILLS.filter((s) => s.category === category)
}
