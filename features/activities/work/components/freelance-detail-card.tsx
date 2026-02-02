'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog'

import { EmployeeCard } from '../../../../shared/components/business/employee-card'

interface FreelanceDetailCardProps {
  category: string
  description: string
  duration: number
  energyCost: number
  image: string
  onApply?: () => void
  payment: number
  requirements: { skill: string; level: number }[]
  title: string
}

export function FreelanceDetailCard({
  category,
  description,
  duration,
  energyCost,
  image,
  onApply,
  payment,
  requirements,
  title,
}: FreelanceDetailCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <EmployeeCard
        actionLabel="Взять заказ"
        avatar={image}
        cost={{ energy: -energyCost }}
        id={`freelance-${title}`}
        name={title}
        onAction={onApply}
        onSecondaryAction={() => {
          setShowDetails(true)
        }}
        requirements={requirements}
        role="worker"
        roleLabel={category}
        salary={payment}
        salaryLabel=""
        secondaryActionLabel="Подробнее"
        stars={Math.max(1, ...requirements.map((r) => r.level), 1)}
      />

      <Dialog onOpenChange={setShowDetails} open={showDetails}>
        <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription className="text-white/60">Категория: {category}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white/80 leading-relaxed mb-4">{description}</p>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-white/50 mb-1">Оплата</p>
                  <p className="text-2xl font-bold text-green-400">${payment}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Расход энергии</p>
                  <p className="text-2xl font-bold text-amber-400">-{energyCost}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">Длительность</p>
                  <p className="text-2xl font-bold text-blue-400">{duration} кв.</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-white/50 mb-2">Требуемые навыки:</p>
              <div className="space-y-2">
                {requirements.map((req) => (
                  <div
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                    key={req.skill}
                  >
                    <span className="text-white">{req.skill}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          className={`w-4 h-4 ${
                            star <= req.level ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'
                          }`}
                          key={`${req.skill}-star-${String(star)}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full bg-white text-black hover:bg-white/90" onClick={onApply}>
              ВЗЯТЬ ЗАКАЗ (-{energyCost}⚡)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
