'use client'

import { CheckCircle, Briefcase, Users, Globe, Zap } from 'lucide-react'
import React from 'react'

import type { EmployeeCandidate } from '@/core/types'
import { CandidateCard } from '@/shared/components/business/candidate-card'
import { Button } from '@/shared/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/dialog'
import { cn } from '@/shared/utils/utils'

import { ROLE_LABELS } from '../shared-constants'
import { SalarySettings } from './components/salary-settings'
import { useHireDialog } from './hooks/use-hire-dialog'
import { calculateMonthlySalary } from './utils/employee-utils'

interface EmployeeHireDialogProps {
  availableBudget: number
  businessId: string
  businessName: string
  candidates: EmployeeCandidate[]
  isOpen: boolean
  onClose: () => void
  onHire: (candidate: EmployeeCandidate) => void
}

export function EmployeeHireDialog({
  availableBudget,
  candidates,
  isOpen,
  onClose,
  onHire,
}: EmployeeHireDialogProps) {
  const {
    activeTab,
    customKPI,
    customSalary,
    displayCandidates,
    selectedCandidate,
    setActiveTab,
    setCustomKPI,
    setCustomSalary,
    setSelectedCandidate,
  } = useHireDialog(isOpen, candidates)

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="bg-zinc-900/98 backdrop-blur-xl border-white/20 text-white w-[95vw] md:w-[85vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl flex items-center gap-3 text-white">
            <Briefcase className="w-7 h-7 text-blue-400" />
            Выбор кандидата - {ROLE_LABELS[candidates[0]?.role]}
          </DialogTitle>
          <p className="text-white/80 text-base mt-2">
            Доступный бюджет:{' '}
            <span className="text-green-400 font-bold">${availableBudget.toLocaleString()}</span>
            /мес
          </p>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-b border-white/10 pb-4">
          <Button
            className={
              activeTab === 'npc'
                ? 'bg-blue-600'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }
            onClick={() => {
              setActiveTab('npc')
            }}
            variant={activeTab === 'npc' ? 'default' : 'ghost'}
          >
            <Users className="w-4 h-4 mr-2" />
            Рынок труда
          </Button>
          <Button
            className={
              activeTab === 'players'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }
            onClick={() => {
              setActiveTab('players')
            }}
            variant={activeTab === 'players' ? 'default' : 'ghost'}
          >
            <Globe className="w-4 h-4 mr-2" />
            Онлайн игроки
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {displayCandidates.length === 0 && (
            <div className="text-center py-12 bg-white/2 rounded-2xl border border-dashed border-white/10">
              <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-sm">
                {activeTab === 'players' ? 'Нет игроков онлайн' : 'Нет доступных кандидатов'}
              </p>
            </div>
          )}

          {displayCandidates.map((candidate) => (
            <CandidateCard
              canAfford={true} // Убираем блокировку на уровне карточки для простоты клика
              candidate={candidate}
              isMe={candidate.id.startsWith('player_')}
              isSelected={selectedCandidate?.id === candidate.id}
              key={candidate.id}
              onClick={() => {
                setSelectedCandidate(candidate)
              }}
            />
          ))}
        </div>

        {activeTab === 'players' &&
          selectedCandidate &&
          !selectedCandidate.id.startsWith('player_') && (
            <div className="mt-6">
              <SalarySettings
                kpiBonus={customKPI}
                onKPIChange={setCustomKPI}
                onSalaryChange={setCustomSalary}
                salary={customSalary}
              />
            </div>
          )}

        {/* Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
          <Button
            className="px-6 h-12 rounded-xl text-white/40 hover:text-white hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest transition-all"
            onClick={onClose}
            variant="ghost"
          >
            Отмена
          </Button>
          <Button
            className={cn(
              'flex-1 h-12 rounded-xl font-black uppercase text-xs tracking-widest transition-all',
              activeTab === 'players' ? 'bg-purple-600' : 'bg-blue-600',
              'disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed',
            )}
            disabled={!selectedCandidate}
            onClick={() => {
              if (selectedCandidate) {
                onHire(selectedCandidate)
              }
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <div className="flex flex-col items-start leading-tight">
                <span>
                  {activeTab === 'players'
                    ? selectedCandidate?.id.startsWith('player_')
                      ? 'Занять слот'
                      : 'Отправить оффер'
                    : 'Нанять'}
                </span>
                <span className="text-[9px] opacity-70 flex items-center gap-1">
                  <Zap className="w-2 h-2 fill-yellow-400 text-yellow-400" /> -5 энергии
                </span>
              </div>
              {selectedCandidate && (
                <span className="ml-2 opacity-60">
                  $
                  {(activeTab === 'players'
                    ? calculateMonthlySalary(customSalary)
                    : selectedCandidate.requestedSalary
                  ).toLocaleString()}
                </span>
              )}
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
