'use client'

import { useState } from 'react'

import { getShopItemsByCategory } from '@/core/lib/data-loaders/shop-loader'
import { useGameStore } from '@/core/model/store'
import type { ShopCategory } from '@/core/types/shop.types'

import { CategoryTabs } from './components/category-tabs'
import { ShopHeader } from './components/shop-header'
import { ShopItemCard } from './components/shop-item-card'

export const ShopActivity = () => {
  const { buyItem, player, setLifestyle, setPlayerHousing } = useGameStore()
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('housing')

  if (!player) return null

  const items = getShopItemsByCategory(selectedCategory, player.countryId)

  return (
    <div className="space-y-6">
      <ShopHeader balance={player.stats.money} />
      <CategoryTabs onSelect={setSelectedCategory} selected={selectedCategory} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((item) => (
          <ShopItemCard
            category={selectedCategory}
            isActiveLifestyle={player.activeLifestyle[item.category] === item.id}
            isCurrentHousing={player.housingId === item.id}
            item={item}
            key={item.id}
            onBuyItem={buyItem}
            onSetHousing={setPlayerHousing}
            onSetLifestyle={setLifestyle}
            playerMoney={player.stats.money}
          />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">В этой категории пока ничего нет</p>
        </div>
      )}
    </div>
  )
}
