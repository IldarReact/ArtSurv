import { Check, Key } from 'lucide-react'

import { useEconomy } from '@/core/hooks'
import type { ShopItem, ShopCategory } from '@/core/types/shop.types'
import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'

import { useShopPricing } from '../use-shop-pricing'
import { formatPrice, getHousingTypeLabel } from '../utils/formatters'
import { getStatIcon } from '../utils/icons'

interface ShopItemCardProps {
  category: ShopCategory
  isActiveLifestyle: boolean
  isCurrentHousing: boolean
  item: ShopItem
  onBuyItem: (id: string) => void
  onSetHousing: (id: string) => void
  onSetLifestyle: (category: string, id: string | undefined) => void
  playerMoney: number
}

const categoryImages: Record<ShopCategory, string> = {
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop',
  health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=400&fit=crop',
  housing: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop',
  services: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&h=400&fit=crop',
  transport: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=400&fit=crop',
}

function ItemHeader({
  category,
  isCurrentHousing,
  isHousing,
  item,
}: {
  category: ShopCategory
  isCurrentHousing: boolean
  isHousing: boolean
  item: ShopItem
}) {
  return (
    <div className="relative h-40 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={item.name}
        className="w-full h-full object-cover transform rotate-1 scale-110 group-hover:scale-115 transition-transform duration-500"
        src={categoryImages[category]}
      />
      <div className="absolute inset-0 bg-black/40" />

      {isHousing && (
        <div className="absolute top-3 left-3">
          <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 rounded-lg px-3 py-1.5">
            <Key className="w-4 h-4 text-yellow-400" />
          </div>
        </div>
      )}

      {isCurrentHousing && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1.5 rounded-lg">
            <Check className="w-4 h-4" />
            Живу здесь
          </div>
        </div>
      )}
    </div>
  )
}

function ItemEffects({ effects }: { effects: ShopItem['effects'] }) {
  if (!effects || Object.values(effects).every((v) => !v)) return null

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(effects).map(([stat, value]) => {
        if (!value) return null
        return (
          <div
            className="flex items-center gap-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-2.5 py-1"
            key={stat}
          >
            <span className="text-lg">{getStatIcon(stat)}</span>
            <span className={value > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
              {value > 0 ? `+${String(value)}` : String(value)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ItemPrice({
  canAfford,
  displayPrice,
  isRecurring,
}: {
  canAfford: boolean
  displayPrice: number | undefined
  isRecurring: boolean
}) {
  return (
    <div className="flex flex-col">
      <span className={`text-xl font-black ${canAfford ? 'text-white' : 'text-red-400'}`}>
        {formatPrice(displayPrice)}
      </span>
      {isRecurring && (
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">в квартал</span>
      )}
    </div>
  )
}

function ItemActions({
  canAfford,
  category,
  isActiveLifestyle,
  isCurrentHousing,
  isHousing,
  item,
  onBuyItem,
  onSetHousing,
  onSetLifestyle,
}: {
  canAfford: boolean
  category: ShopCategory
  isActiveLifestyle: boolean
  isCurrentHousing: boolean
  isHousing: boolean
  item: ShopItem
  onBuyItem: (id: string) => void
  onSetHousing: (id: string) => void
  onSetLifestyle: (category: string, id: string | undefined) => void
}) {
  const getButtonContent = () => {
    if (isCurrentHousing) return 'Текущее'
    if (isActiveLifestyle) return 'Активно'
    return (
      <>
        <Check className="w-4 h-4 mr-2" />
        {item.isRecurring ? 'Выбрать' : 'Купить'}
      </>
    )
  }

  const getButtonStyles = () => {
    if (isActiveLifestyle || isCurrentHousing) {
      return 'bg-zinc-800 text-zinc-400 cursor-default'
    }
    if (canAfford) {
      return 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
    }
    return 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
  }

  const handleClick = () => {
    if (isHousing) {
      onSetHousing(item.id)
    } else if (item.isRecurring) {
      onSetLifestyle(category, isActiveLifestyle ? undefined : item.id)
    } else {
      onBuyItem(item.id)
    }
  }

  const isDisabled = (!canAfford && !isActiveLifestyle && !isCurrentHousing) || isCurrentHousing

  return (
    <Button
      className={`px-6 h-11 rounded-xl font-bold transition-all duration-300 ${getButtonStyles()}`}
      disabled={isDisabled}
      onClick={handleClick}
    >
      {getButtonContent()}
    </Button>
  )
}

export function ShopItemCard({
  category,
  isActiveLifestyle,
  isCurrentHousing,
  item,
  onBuyItem,
  onSetHousing,
  onSetLifestyle,
  playerMoney,
}: ShopItemCardProps) {
  const country = useEconomy()
  const { canAfford, displayPrice, isRecurring } = useShopPricing(item, playerMoney)

  const isHousing = item.category === 'housing'

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 border-2 backdrop-blur-xl group ${
        isCurrentHousing
          ? 'border-green-500 bg-green-900/30 shadow-lg shadow-green-500/20'
          : 'border-zinc-700/80 hover:border-zinc-500 bg-zinc-900/70'
      }`}
    >
      <ItemHeader
        category={category}
        isCurrentHousing={isCurrentHousing}
        isHousing={isHousing}
        item={item}
      />

      {/* Маттовое покрытие с текстом */}
      <div className="relative bg-zinc-950/95 backdrop-blur-sm p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
          {isHousing && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-300">{getHousingTypeLabel(item, country)}</span>
              {item.capacity ? (
                <span className="text-xs text-white/60">• {item.capacity} мест</span>
              ) : null}
            </div>
          )}
        </div>

        <p className="text-sm text-blue-100/80 leading-relaxed">{item.description}</p>

        <ItemEffects effects={item.effects} />

        <div className="flex items-center justify-between pt-2">
          <ItemPrice canAfford={canAfford} displayPrice={displayPrice} isRecurring={isRecurring} />

          <ItemActions
            canAfford={canAfford}
            category={category}
            isActiveLifestyle={isActiveLifestyle}
            isCurrentHousing={isCurrentHousing}
            isHousing={isHousing}
            item={item}
            onBuyItem={onBuyItem}
            onSetHousing={onSetHousing}
            onSetLifestyle={onSetLifestyle}
          />
        </div>
      </div>
    </Card>
  )
}
