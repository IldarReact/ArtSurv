import { Code, DollarSign, Globe, TrendingUp, Palette } from 'lucide-react'
import React from 'react'

import { SectionSeparator } from '@/shared/components/section-separator'

import { OpportunityCard } from '../../components/opportunity-card'
import { CourseCard } from '../components/course-card'

interface CoursesSectionProps {
  getInflatedCoursePrice: (price: number) => number
  handleCourseEnroll: (
    name: string,
    cost: number,
    energy: number,
    skill: string,
    duration: string,
  ) => void
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  getInflatedCoursePrice,
  handleCourseEnroll,
}) => (
  <div className="space-y-4">
    <SectionSeparator title="Курсы и тренинги" />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <OpportunityCard
        actionLabel="Выбрать язык"
        description="Знание иностранных языков необходимо для работы в международных компаниях и переезда."
        icon={<Globe className="w-6 h-6 text-[#004d00]" />}
        image="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop"
        title="Изучение языков"
      >
        <div className="space-y-4">
          <CourseCard
            cost={500}
            description="Курс делового английского для работы и переговоров."
            duration="3 месяца"
            energyCost={15}
            image="https://images.unsplash.com/photo-1526304640152-d4619684e484?w=800&h=600&fit=crop"
            inflatedCost={getInflatedCoursePrice(500)}
            intelligenceBonus={5}
            onEnroll={() => {
              handleCourseEnroll('Английский язык (Business)', 500, 15, 'English', '3 месяца')
            }}
            skillBonus="English"
            title="Английский язык (Business)"
          />
          <CourseCard
            cost={600}
            description="Интенсивный курс немецкого языка для начинающих."
            duration="6 месяцев"
            energyCost={20}
            image="https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=800&h=600&fit=crop"
            inflatedCost={getInflatedCoursePrice(600)}
            intelligenceBonus={5}
            onEnroll={() => {
              handleCourseEnroll('Немецкий язык (Intensive)', 600, 20, 'German', '6 месяцев')
            }}
            skillBonus="German"
            title="Немецкий язык (Intensive)"
          />
        </div>
      </OpportunityCard>

      <OpportunityCard
        actionLabel="Выбрать курс"
        description="Освойте востребованные языки программирования и технологии."
        icon={<Code className="w-6 h-6 text-purple-400" />}
        image="https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=600&fit=crop"
        title="Программирование"
      >
        <div className="space-y-4">
          <CourseCard
            cost={1200}
            description="Изучение Python, Pandas и основ машинного обучения."
            duration="6 месяцев"
            energyCost={25}
            image="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600&fit=crop"
            inflatedCost={getInflatedCoursePrice(1200)}
            intelligenceBonus={10}
            onEnroll={() => {
              handleCourseEnroll('Python для Data Science', 1200, 25, 'Python', '6 месяцев')
            }}
            skillBonus="Python"
            title="Python для Data Science"
          />
          <CourseCard
            cost={1800}
            description="Анализ данных, визуализация и машинное обучение."
            duration="9 месяцев"
            energyCost={30}
            image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
            inflatedCost={getInflatedCoursePrice(1800)}
            intelligenceBonus={15}
            onEnroll={() => {
              handleCourseEnroll('Data Science и Аналитика', 1800, 30, 'Data Science', '9 месяцев')
            }}
            skillBonus="Data Science"
            title="Data Science и Аналитика"
          />
          <CourseCard
            cost={1500}
            description="Разработка веб-приложений на React и Node.js."
            duration="9 месяцев"
            energyCost={30}
            image="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop"
            inflatedCost={getInflatedCoursePrice(1500)}
            intelligenceBonus={12}
            onEnroll={() => {
              handleCourseEnroll('Fullstack JavaScript', 1500, 30, 'JS/React', '9 месяцев')
            }}
            skillBonus="JS/React"
            title="Fullstack JavaScript"
          />
        </div>
      </OpportunityCard>

      <OpportunityCard
        actionLabel="Выбрать курс"
        description="Освойте навыки продвижения продуктов и управления брендом."
        icon={<TrendingUp className="w-6 h-6 text-green-400" />}
        image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
        title="Маркетинг и Бизнес"
      >
        <div className="space-y-4">
          <CourseCard
            cost={900}
            description="Интернет-маркетинг, SEO, контекстная реклама и SMM."
            duration="6 месяцев"
            energyCost={20}
            image="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop"
            inflatedCost={getInflatedCoursePrice(900)}
            intelligenceBonus={8}
            onEnroll={() => {
              handleCourseEnroll('Digital Marketing', 900, 20, 'Маркетинг', '6 месяцев')
            }}
            skillBonus="Маркетинг"
            title="Digital Marketing"
          />
        </div>
      </OpportunityCard>

      <OpportunityCard
        actionLabel="Выбрать курс"
        description="Создавайте визуальный контент и пользовательские интерфейсы."
        icon={<Palette className="w-6 h-6 text-pink-400" />}
        image="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop"
        title="Дизайн и Креатив"
      >
        <div className="space-y-4">
          <CourseCard
            cost={700}
            description="Основы графического дизайна, композиция, типографика."
            duration="3 месяца"
            energyCost={18}
            image="https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop"
            inflatedCost={getInflatedCoursePrice(700)}
            intelligenceBonus={6}
            onEnroll={() => {
              handleCourseEnroll('Graphic Design Basics', 700, 18, 'Дизайн', '3 месяца')
            }}
            skillBonus="Дизайн"
            title="Graphic Design Basics"
          />
          <CourseCard
            cost={500}
            description="Профессиональная обработка изображений и создание графики."
            duration="3 месяца"
            energyCost={15}
            image="https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=600&fit=crop"
            inflatedCost={getInflatedCoursePrice(500)}
            intelligenceBonus={5}
            onEnroll={() => {
              handleCourseEnroll('Adobe Photoshop Pro', 500, 15, 'Photoshop', '3 месяца')
            }}
            skillBonus="Photoshop"
            title="Adobe Photoshop Pro"
          />
        </div>
      </OpportunityCard>

      <OpportunityCard
        actionLabel="Начать обучение"
        description="Научитесь управлять деньгами, инвестировать и создавать пассивный доход."
        icon={<DollarSign className="w-6 h-6 text-[#004d00]" />}
        image="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop"
        title="Финансовая грамотность"
      >
        <div className="space-y-4">
          <CourseCard
            cost={300}
            description="Как работают акции, облигации и фондовый рынок."
            duration="3 месяца"
            energyCost={10}
            image="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop"
            inflatedCost={getInflatedCoursePrice(300)}
            intelligenceBonus={5}
            onEnroll={() => {
              handleCourseEnroll('Основы инвестирования', 300, 10, 'Инвестиции', '3 месяца')
            }}
            skillBonus="Инвестиции"
            title="Основы инвестирования"
          />
          <CourseCard
            cost={200}
            description="Бюджетирование, планирование и оптимизация расходов."
            duration="3 месяца"
            energyCost={5}
            image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop"
            inflatedCost={getInflatedCoursePrice(200)}
            intelligenceBonus={3}
            onEnroll={() => {
              handleCourseEnroll(
                'Управление личными финансами',
                200,
                5,
                'Фин. грамотность',
                '3 месяца',
              )
            }}
            skillBonus="Фин. грамотность"
            title="Управление личными финансами"
          />
        </div>
      </OpportunityCard>
    </div>
  </div>
)
