'use client'

import { Store } from 'lucide-react'
import React from 'react'

import { useEconomy } from '@/core/hooks'
import { calculateEstimatedMonthlyProfit } from '@/core/lib/business/business-financials'
import { createBusinessPurchase } from '@/core/lib/business/purchase-logic'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import {
  getAllBusinessTypesForCountry,
  type BusinessTemplate,
} from '@/core/lib/data-loaders/businesses-loader'
import { isMultiplayerActive } from '@/core/lib/multiplayer'
import { useGameStore } from '@/core/model/store'
import type { Business } from '@/core/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/dialog'

import { PartnerSelectionDialog } from '../../partner-selection-dialog'
import { formatCurrency } from '../utils/business-ui-mappers'
import { BusinessCard } from './all-businesses-dialog/business-card'
import { DialogTriggerContent } from './all-businesses-dialog/dialog-trigger-content'
import { InfoBanner } from './all-businesses-dialog/info-banner'

interface AllBusinessesDialogProps {
  onError: (message: string) => void
  onOpenBusiness: (business: Business, upfrontCost: number) => void
  onOpenWithPartner?: (
    partnerId: string,
    partnerName: string,
    playerShare: number,
    template: BusinessTemplate,
  ) => void
  onSuccess: (message: string) => void
  playerCash: number
  playerEnergy: number
}

export function AllBusinessesDialog({
  onError,
  onOpenBusiness,
  onOpenWithPartner,
  onSuccess,
  playerCash,
  playerEnergy,
}: AllBusinessesDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string | null>(null)
  const [partnerDialogOpen, setPartnerDialogOpen] = React.useState(false)
  const [templateForPartner, setTemplateForPartner] = React.useState<BusinessTemplate | null>(null)
  const economy = useEconomy()
  const player = useGameStore((state) => state.player)
  const currentTurn = useGameStore((state) => state.turn)

  const countryId = player?.countryId ?? 'us'
  const businessTemplates = getAllBusinessTypesForCountry(countryId)

  const handleOpenBusiness = (template: BusinessTemplate) => {
    try {
      const inflatedTotalCost = economy
        ? getInflatedPrice(template.initialCost, economy, 'business')
        : template.initialCost

      const inflationFactor = inflatedTotalCost / template.initialCost
      const inflatedUpfrontCost = Math.round(template.upfrontCost * inflationFactor)

      const { business } = createBusinessPurchase(
        {
          description: template.description ?? '',
          employeeRoles: template.employeeRoles,
          id: template.id,
          initialCost: template.initialCost,
          maxEmployees: template.maxEmployees,
          minEmployees: template.minEmployees,
          monthlyExpenses: template.monthlyExpenses,
          monthlyIncome: template.monthlyIncome,
          name: template.name,
          price: template.price,
          quantity: template.quantity,
          type: template.type,
          upfrontPaymentPercentage: Math.round((template.upfrontCost / template.initialCost) * 100),
        },
        inflatedTotalCost,
        currentTurn,
      )

      if (playerCash >= inflatedUpfrontCost && playerEnergy >= 15) {
        onOpenBusiness(business, inflatedUpfrontCost)
        onSuccess(`Бизнес "${template.name}" успешно открыт!`)
        setIsOpen(false)
      } else {
        if (playerCash < inflatedUpfrontCost) {
          onError(`Недостаточно средств. Необходимо $${inflatedUpfrontCost.toLocaleString()}`)
        } else {
          onError(`Недостаточно энергии. Необходимо 15 ед.`)
        }
      }
    } catch {
      onError('Ошибка при открытии бизнеса')
    }
  }

  return (
    <>
      <div
        onClick={() => {
          setIsOpen(true)
        }}
      >
        <DialogTriggerContent businessTemplates={businessTemplates} />
      </div>

      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogContent
          className="bg-zinc-900/98 backdrop-blur-xl border-white/20 text-white w-[95vw] md:w-[85vw] max-w-[1400px] max-h-[90vh] overflow-y-auto"
          data-testid="all-businesses-dialog-content"
        >
          <DialogHeader>
            <DialogTitle className="text-3xl flex items-center gap-3 text-white">
              <Store className="w-8 h-8 text-emerald-400" />
              Выбор бизнеса
            </DialogTitle>
            <p className="text-white/80 text-base mt-2">
              Ваш бюджет:{' '}
              <span className="text-green-400 font-bold">${playerCash.toLocaleString()}</span>
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-6 mt-6">
            {businessTemplates.map((template) => {
              const inflatedTotalCost = economy
                ? getInflatedPrice(template.initialCost, economy, 'business')
                : template.initialCost

              const inflationFactor = inflatedTotalCost / template.initialCost
              const upfrontCost = Math.round(template.upfrontCost * inflationFactor)
              const canAffordMoney = playerCash >= upfrontCost
              const canAffordEnergy = playerEnergy >= 15
              const canAfford = canAffordMoney && canAffordEnergy
              const isSelected = selectedBusinessId === template.id

              const corporateTaxRate = economy?.corporateTaxRate ?? 15
              const estProfit = calculateEstimatedMonthlyProfit(
                template.monthlyIncome,
                template.monthlyExpenses,
                corporateTaxRate,
              )

              const minIncome = Math.round(estProfit * 0.7)
              const maxIncome = Math.round(estProfit * 1.3)

              const incomeRange = `${formatCurrency(minIncome)} - ${formatCurrency(maxIncome)}/мес`
              const expenses = `${formatCurrency(template.monthlyExpenses)}/мес`

              return (
                <BusinessCard
                  canAfford={canAfford}
                  expenses={expenses}
                  incomeRange={incomeRange}
                  isSelected={isSelected}
                  key={template.id}
                  onOpen={handleOpenBusiness}
                  onOpenWithPartner={(t) => {
                    setTemplateForPartner(t)
                    setPartnerDialogOpen(true)
                  }}
                  onSelect={() => {
                    setSelectedBusinessId(template.id)
                  }}
                  showPartnerButton={!!onOpenWithPartner && isMultiplayerActive()}
                  template={template}
                  upfrontCost={upfrontCost}
                />
              )
            })}
          </div>

          {/* Partner Selection Dialog */}
          {templateForPartner && (
            <PartnerSelectionDialog
              businessCost={
                economy
                  ? getInflatedPrice(templateForPartner.initialCost, economy, 'business')
                  : templateForPartner.initialCost
              }
              businessName={templateForPartner.name}
              isOpen={partnerDialogOpen}
              onClose={() => {
                setPartnerDialogOpen(false)
                setTemplateForPartner(null)
              }}
              onSelectPartner={(partnerId, partnerName, playerShare) => {
                onOpenWithPartner?.(partnerId, partnerName, playerShare, templateForPartner)
              }}
            />
          )}

          <InfoBanner />
        </DialogContent>
      </Dialog>
    </>
  )
}
