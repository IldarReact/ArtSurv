'use client'

import { ArrowLeft } from 'lucide-react'
import React from 'react'

import { useGameStore } from '@/core/model/store'
import type { ActivityType } from '@/core/types'
import { Button } from '@/shared/components/button'
import { ExpandableCard } from '@/shared/components/expandable-card'

// Import activities
import { BanksActivity } from '../activities/bank/banks-activity'
import { EducationActivity } from '../activities/education/education-activity'
import { FamilyActivity } from '../activities/family/family-activity'
import { InvestmentsActivity } from '../activities/investments/investments-activity'
import { RelocationActivity } from '../activities/relocation/relocation-activity'
import { RestActivity } from '../activities/rest/rest-activity'
import { ShopActivity } from '../activities/shop'
import { WorkActivity } from '../activities/work/work-activity'

interface Activity {
  component: React.ComponentType
  description: string
  details: string
  icon: string
  id: ActivityType
  title: string
}

const ACTIVITIES: Activity[] = [
  {
    component: ShopActivity,
    description: 'Покупай товары и услуги',
    details: 'Еда, здоровье, развлечения, транспорт',
    icon: '🛒',
    id: 'shop',
    title: 'МАГАЗИНы',
  },
  {
    component: FamilyActivity,
    description: 'Управляй семьёй и отношениями',
    details: 'Управление семьей, брак, дети, поддержка родителей',
    icon: '👨‍👩‍👧‍👦',
    id: 'family',
    title: 'СЕМЬЯ',
  },
  {
    component: WorkActivity,
    description: 'Зарабатывай основной доход',
    details: 'Зарплата, карьерный рост, переквалификация',
    icon: '💼',
    id: 'work',
    title: 'РАБОТА',
  },
  {
    component: EducationActivity,
    description: 'Учись и повышай квалификацию',
    details: 'Университеты, курсы, навыки',
    icon: '🎓',
    id: 'education',
    title: 'ОБРАЗОВАНИЕ',
  },
  {
    component: InvestmentsActivity,
    description: 'Инвестируй в акции и недвижимость',
    details: 'Биржа, портфель, дивиденды, аренда',
    icon: '📈',
    id: 'investments',
    title: 'ИНВЕСТИЦИИ',
  },
  {
    component: BanksActivity,
    description: 'Кредиты, ипотека, депозиты',
    details: 'Займы, переводы, вклады',
    icon: '🏦',
    id: 'banking',
    title: 'БАНКИ',
  },
  {
    component: RelocationActivity,
    description: 'Смена страны жительства',
    details: 'Переезд в новую страну с новыми возможностями',
    icon: '✈️',
    id: 'relocation',
    title: 'ПЕРЕЕЗД',
  },
  {
    component: RestActivity,
    description: 'Расслабление и восстановление',
    details: 'Путешествия, хобби, медитация',
    icon: '🏖️',
    id: 'leisure',
    title: 'ОТДЫХ',
  },
]

export function ActivitiesPanel() {
  const activeActivity = useGameStore((state) => state.activeActivity)
  const setActiveActivity = useGameStore((state) => state.setActiveActivity)

  if (activeActivity) {
    const activity = ACTIVITIES.find((a) => a.id === activeActivity)
    const Component = activity?.component

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            className="text-white hover:bg-white/10"
            onClick={() => {
              setActiveActivity(null)
            }}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">{activity?.icon}</span>
            {activity?.title}
          </h2>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[500px]">
          {Component ? <Component /> : <div className="text-white/50">Компонент не найден</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white mb-6">ВОЗМОЖНОСТИ</h3>
      <div className="grid grid-cols-1 gap-4">
        {ACTIVITIES.map((activity) => (
          <ExpandableCard
            description={activity.description}
            image={`/placeholder.svg?height=80&width=80&query=${activity.icon}`}
            key={activity.id}
            title={activity.title}
          >
            <div className="space-y-4">
              <p className="text-white/60">{activity.details}</p>
              <Button
                className="w-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => {
                  setActiveActivity(activity.id)
                }}
              >
                Открыть
              </Button>
            </div>
          </ExpandableCard>
        ))}
      </div>
    </div>
  )
}
