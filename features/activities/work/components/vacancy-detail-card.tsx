'use client'

import { Building, Info, CheckCircle } from 'lucide-react'
import { useState } from 'react'

import type { Job } from '@/core/types/job.types'
import { EmployeeCard } from '@/shared/components/business/employee-card'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { cn } from '@/shared/utils/utils'

interface VacancyDetailCardProps {
  title: string
  company: string
  salary: number
  energyCost?: number
  requirements: Array<{ skill: string; level: number }>
  image: string
  onApply?: () => void
  jobCost?: Job['cost']
  isApplied?: boolean
}

export function VacancyDetailCard({
  title,
  company,
  salary,
  energyCost = 20,
  requirements,
  image,
  onApply,
  jobCost,
  isApplied = false,
}: VacancyDetailCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const formattedSalary = `$${salary.toLocaleString()}/мес`

  return (
    <>
      <EmployeeCard
        id={`vacancy-${title}-${company}`}
        name={title}
        role="worker" // Дефолтная роль для отображения иконки, если не указана
        roleLabel="Вакансия"
        company={company}
        salary={salary}
        salaryLabel="/мес"
        avatar={image}
        isVacancy={true}
        stars={Math.max(1, ...requirements.map((r) => r.level), 1)}
        requirements={requirements}
        cost={jobCost}
        isApplied={isApplied}
        onAction={onApply}
        actionLabel={isApplied ? 'Отправлено' : 'Откликнуться'}
        actionIcon={
          isApplied ? <CheckCircle className="w-3 h-3 mr-1" /> : <Info className="w-3 h-3 mr-1" />
        }
        actionVariant={isApplied ? 'secondary' : 'default'}
        onSecondaryAction={() => setShowDetails(true)}
        secondaryActionLabel="Подробнее"
        className={isApplied ? 'opacity-60' : ''}
      />

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
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
                  {requirements.map((req, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5"
                    >
                      <span className="font-bold text-zinc-100">{req.skill}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div
                            key={j}
                            className={cn(
                              'w-2 h-2 rounded-full',
                              j < req.level
                                ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                                : 'bg-white/10',
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <Button
                  onClick={onApply}
                  disabled={isApplied}
                  className={cn(
                    'w-full h-14 text-lg font-black rounded-2xl transition-all duration-300',
                    isApplied
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98]',
                  )}
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
