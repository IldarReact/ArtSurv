import React from 'react'

import type { Skill } from '@/core/types'
import { SectionSeparator } from '@/shared/components/section-separator'

import { SkillCard } from '../components/skill-card'

interface SkillsSectionProps {
  hasSkills: boolean
  skills: Skill[]
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ hasSkills, skills }) => (
  <div className="space-y-4">
    <SectionSeparator title="Текущие навыки" />

    {!hasSkills ? (
      <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
        <p className="text-white/50">
          У вас пока нет изученных навыков. Пройдите обучение, чтобы их получить.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <SkillCard key={skill.id} level={skill.level} name={skill.name} />
        ))}
      </div>
    )}
  </div>
)
