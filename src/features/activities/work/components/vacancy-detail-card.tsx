'use client'

import { Building, Info, CheckCircle } from 'lucide-react'
import { useState } from 'react'

import type { Job } from '@/core/types/job.types'
import { EmployeeCard } from '@/shared/components/business/employee-card'
import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog'
import { cn } from '@/shared/utils/utils'

interface VacancyDetailCardProps {
  company: string
  energyCost?: number
  image: string
  isApplied?: boolean
  jobCost?: Job['cost']
  onApply?: () => void
  requirements: { skill: string; level: number }[]
  salary: number
  title: string
}

export function VacancyDetailCard({
  company,
  energyCost = 20,
  image,
  isApplied = false,
  jobCost,
  onApply,
  requirements,
  salary,
  title,
}: VacancyDetailCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const formattedSalary = `$${salary.toLocaleString()}/мес`

  return (
    <>
      <EmployeeCard
        actionIcon={
          isApplied ? <CheckCircle className="w-3 h-3 mr-1" /> : <Info className="w-3 h-3 mr-1" />
        }
        actionLabel={isApplied ? 'Отправлено' : 'Откликнуться'}
        actionVariant={isApplied ? 'secondary' : 'default'}
        avatar={image}
        className={isApplied ? 'opacity-60' : ''}
        company={company}
        cost={jobCost}
        id={`vacancy-${title}-${company}`}
        isApplied={isApplied}
        isVacancy={true}
        name={title}
        onAction={onApply}
        onSecondaryAction={() => {
          setShowDetails(true)
        }}
        requirements={requirements}
        role="worker" // Дефолтная роль для отображения иконки, если не указана
        roleLabel="Вакансия"
        salary={salary}
        salaryLabel="/мес"
        secondaryActionLabel="Подробнее"
        stars={Math.max(1, ...requirements.map((r) => r.level), 1)}
      />

      <Dialog onOpenChange={setShowDetails} open={showDetails}>
        <DialogContent className="bg-zinc-900/95 backdrop-blur-2xl border-white/10 text-white max-w-2xl p-0 overflow-hidden rounded-3xl shadow-2xl shadow-black/50">
          <div className="p-6 md:p-8">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight">{title}</DialogTitle>
              <DialogDescription className="text-white/40 font-medium uppercase tracking-wider flex items-center gap-2 mt-1">
                <Building className="w-4 h-4" />
                {company}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-8">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">
                  Зарплата
                </p>
                <p className="text-3xl font-black text-green-400">{formattedSalary}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-4">
                  Требования к навыкам
                </p>
                <div className="space-y-3">
                  {requirements.map((req) => (
                    <div
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5"
                      key={req.skill}
                    >
                      <span className="font-bold text-zinc-100">{req.skill}</span>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((starIndex) => (
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full',
                              starIndex < req.level
                                ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                                : 'bg-white/10',
                            )}
                            key={`${req.skill}-star-${String(starIndex)}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button
                  className={cn(
                    'w-full h-14 text-lg font-black rounded-2xl transition-all duration-300',
                    isApplied
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98]',
                  )}
                  disabled={isApplied}
                  onClick={onApply}
                >
                  {isApplied ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      ОТКЛИК ОТПРАВЛЕН
                    </span>
                  ) : (
                    'ОТКЛИКНУТЬСЯ НА ВАКАНСИЮ'
                  )}
                </Button>
                <p className="text-center text-xs font-bold text-white/20 uppercase tracking-widest">
                  Расход энергии: {energyCost}⚡
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
