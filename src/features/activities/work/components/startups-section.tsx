'use client'

import { Rocket, Brain, Zap } from 'lucide-react'
import React from 'react'

import { useGameStore } from '@/core/model/store'
import type { BusinessIdea } from '@/core/types/idea.types'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Progress } from '@/shared/components/progress'
import { OpportunityCard } from '@/src/features/activities/components/opportunity-card'

import { IdeaManagementDialog } from './idea-management-dialog'

export function StartupsSection() {
  const developIdea = useGameStore((state) => state.developIdea)
  const discardIdea = useGameStore((state) => state.discardIdea)
  const generateIdea = useGameStore((state) => state.generateIdea)
  const launchBusinessFromIdea = useGameStore((state) => state.launchBusinessFromIdea)
  const player = useGameStore((state) => state.player)

  const [selectedIdea, setSelectedIdea] = React.useState<BusinessIdea | null>(null)

  if (!player) return null

  const handleGenerate = () => {
    if (player.stats.energy >= 20) {
      generateIdea()
    }
  }

  return (
    <>
      <OpportunityCard
        actionLabel={player.businessIdeas.length > 0 ? 'Управление идеями' : 'Найти идею'}
        description="Генерируйте идеи, создавайте прототипы и запускайте инновационные бизнесы."
        icon={<Rocket className="w-6 h-6 text-purple-400" />}
        image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop"
        title="Стартапы и Идеи"
      >
        <div className="space-y-4">
          {/* Кнопка генерации */}
          <Button
            className="w-full bg-linear-to-red from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg group"
            disabled={player.stats.energy < 20}
            onClick={handleGenerate}
          >
            <Brain className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Генерировать идею
            <Badge className="ml-2 bg-white/20 text-white border-0" variant="secondary">
              <Zap className="w-3 h-3 mr-1" /> -20
            </Badge>
          </Button>

          {/* Список идей */}
          {player.businessIdeas.length > 0 ? (
            <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {player.businessIdeas.map((idea) => (
                <button
                  className="w-full text-left bg-white/5 hover:bg-white/10 p-3 rounded-lg cursor-pointer transition-colors border border-white/5 hover:border-white/20"
                  key={idea.id}
                  onClick={() => {
                    setSelectedIdea(idea)
                  }}
                  type="button"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-white text-sm">{idea.name}</h4>
                      <p className="text-xs text-white/40">{idea.type.toUpperCase()}</p>
                    </div>
                    <Badge
                      className={
                        idea.riskLevel === 'low'
                          ? 'bg-green-500/20 text-green-400'
                          : idea.riskLevel === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : idea.riskLevel === 'high'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-red-500/20 text-red-400'
                      }
                    >
                      {idea.stage === 'launched'
                        ? 'Запущен'
                        : `${idea.developmentProgress.toFixed(0)}%`}
                    </Badge>
                  </div>

                  <Progress className="h-1.5 bg-white/10" value={idea.developmentProgress} />

                  <div className="flex justify-between mt-2 text-xs text-white/40">
                    <span>
                      {idea.stage === 'idea'
                        ? 'Концепция'
                        : idea.stage === 'prototype'
                          ? 'Прототип'
                          : 'MVP'}
                    </span>
                    <span>Потенциал: {(idea.potentialReturn * 100).toFixed(0)}%</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-white/40 text-sm">
              <p>У вас пока нет бизнес-идей.</p>
            </div>
          )}
        </div>
      </OpportunityCard>

      {selectedIdea && (
        <IdeaManagementDialog
          idea={selectedIdea}
          isOpen={!!selectedIdea}
          onClose={() => {
            setSelectedIdea(null)
          }}
          onDevelop={developIdea}
          onDiscard={discardIdea}
          onLaunch={launchBusinessFromIdea}
          playerEnergy={player.stats.energy}
        />
      )}
    </>
  )
}
