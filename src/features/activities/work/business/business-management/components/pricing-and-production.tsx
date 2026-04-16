'use client'

import { DollarSign } from 'lucide-react'
import React from 'react'

import type { Country } from '@/core/types'
import type { Business, BusinessFinancials } from '@/core/types/business.types'

import { PriceControl } from './pricing-and-production/price-control'
import { ProductionControl } from './pricing-and-production/production-control'
import { QuarterlySummary } from './pricing-and-production/quarterly-summary'

interface PricingAndProductionProps {
  country?: Country
  forecastDebug?: BusinessFinancials['debug']
  forecastProfit?: number
  formatCurrency: (value: number) => string
  goals?: Business['businessGoals']
  handlePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  inventory?: {
    currentStock: number
    maxStock: number
  }
  isServiceBased: boolean
  lastQuarterSummary?: Business['lastQuarterSummary']
  price: number
  quantity: number
}

export function PricingAndProduction({
  forecastDebug,
  formatCurrency,
  goals,
  handlePriceChange,
  handleQuantityChange,
  inventory,
  isServiceBased,
  lastQuarterSummary,
  price,
  quantity,
}: PricingAndProductionProps) {
  const priceGoal = goals?.find((g) => g.type === 'price')
  const quantityGoal = goals?.find((g) => g.type === 'quantity')

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-yellow-400" />
        Ценообразование и производство
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PriceControl
          calculatedPrice={forecastDebug?.priceUsed}
          formatCurrency={formatCurrency}
          goal={priceGoal}
          handlePriceChange={handlePriceChange}
          price={price}
        />

        {!isServiceBased && (
          <ProductionControl
            capacity={forecastDebug?.productionCapacity}
            goal={quantityGoal}
            handleQuantityChange={handleQuantityChange}
            inventory={inventory}
            quantity={quantity}
          />
        )}

        <QuarterlySummary formatCurrency={formatCurrency} lastQuarterSummary={lastQuarterSummary} />
      </div>
    </div>
  )
}
