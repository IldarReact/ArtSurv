'use client'

import { TrendingUp, Home, Coins, ChartLine, Plus, Minus } from 'lucide-react'
import { useState } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

import { useGameStore } from '@/core/model/store'
import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/dialog'

const investmentCategories = {
  metals: {
    icon: Coins,
    items: [
      {
        change: 12.4,
        id: 'gold',
        img: 'https://images.unsplash.com/photo-1610375461996-7caf9e7c9b0f?w=600',
        name: 'Золото',
        price: 2100,
        vol: 8,
      },
      {
        change: -5.2,
        id: 'silver',
        img: 'https://images.unsplash.com/photo-1596495781824-70d5d1b9c7c9?w=600',
        name: 'Серебро',
        price: 28,
        vol: 22,
      },
    ],
    title: 'Драгоценные металлы',
  },
  realEstate: {
    icon: Home,
    items: [
      {
        change: 8.2,
        id: 'moscow1',
        img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
        name: '1-комн. Москва',
        price: 12000000,
        vol: 5,
      },
      {
        change: 15.6,
        id: 'sochi',
        img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600',
        name: 'Дом в Сочи',
        price: 35000000,
        vol: 12,
      },
    ],
    title: 'Недвижимость',
  },
  stocks: {
    icon: ChartLine,
    items: [
      {
        change: 12.4,
        id: 'sp500',
        img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600',
        name: 'S&P 500',
        price: 4500,
        vol: 18,
      },
      {
        change: -2.1,
        id: 'apple',
        img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
        name: 'Apple Inc.',
        price: 178,
        vol: 25,
      },
      {
        change: 45.8,
        id: 'tesla',
        img: 'https://images.unsplash.com/photo-1617788138017-80ad6b56a8a8?w=600',
        name: 'Tesla',
        price: 244,
        vol: 62,
      },
      {
        change: 89.3,
        id: 'nvda',
        img: 'https://images.unsplash.com/photo-1620288627223-6b7c4e1c0c6a?w=600',
        name: 'NVIDIA',
        price: 875,
        vol: 71,
      },
    ],
    title: 'Акции',
  },
}

type Asset = (typeof investmentCategories)[keyof typeof investmentCategories]['items'][number]

function CategoryTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: keyof typeof investmentCategories
  onTabChange: (tab: keyof typeof investmentCategories) => void
}) {
  return (
    <div className="flex justify-center gap-4 mb-10">
      {Object.entries(investmentCategories).map(([key, cat]) => {
        const Icon = cat.icon
        const isActive = activeTab === key
        return (
          <button
            className={`px-8 py-4 rounded-2xl flex items-center gap-3 transition-all ${
              isActive
                ? 'bg-white/10 border border-white/20 text-zinc-100'
                : 'bg-white/5 text-zinc-500 hover:bg-white/8'
            }`}
            key={key}
            onClick={() => {
              onTabChange(key as keyof typeof investmentCategories)
            }}
          >
            <Icon className="w-6 h-6" />
            {cat.title}
          </button>
        )
      })}
    </div>
  )
}

function AssetCard({ asset, onSelect }: { asset: Asset; onSelect: (asset: Asset) => void }) {
  return (
    <Card
      className="bg-white/6 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/8 transition-all cursor-pointer"
      onClick={() => {
        onSelect(asset)
      }}
    >
      <div className="h-48 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={asset.name} className="w-full h-full object-cover" src={asset.img} />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h3 className="text-2xl font-bold text-white">{asset.name}</h3>
          <p className="text-4xl font-bold text-white mt-1">${asset.price.toLocaleString()}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">Изменение</span>
          <span
            className={`text-xl font-bold ${asset.change >= 0 ? 'text-zinc-300' : 'text-red-400'}`}
          >
            {asset.change >= 0 ? '+' : ''}
            {asset.change}%
          </span>
        </div>

        <div className="h-20">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={[100, 102, 98, 110, 115, 118].map((v) => ({ v }))}>
              <Line dataKey="v" dot={false} stroke="#525252" strokeWidth={2} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <Button className="w-full bg-white/10 hover:bg-white/20 text-zinc-200 border border-white/20">
          Купить
        </Button>
      </div>
    </Card>
  )
}

function PurchaseDialog({
  onClose,
  onConfirm,
  quantity,
  selectedAsset,
  setQuantity,
}: {
  onClose: () => void
  onConfirm: () => void
  quantity: number
  selectedAsset: Asset | null
  setQuantity: (q: number) => void
}) {
  return (
    <Dialog onOpenChange={onClose} open={!!selectedAsset}>
      <DialogContent className="bg-zinc-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl max-w-6xl p-0 overflow-hidden">
        {selectedAsset && (
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-96 lg:h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="w-full h-full object-cover" src={selectedAsset.img} />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <h2 className="text-5xl font-bold">{selectedAsset.name}</h2>
                <p className="text-6xl font-bold mt-4">${selectedAsset.price.toLocaleString()}</p>
                <p className="text-2xl mt-2 opacity-90">
                  {selectedAsset.change >= 0 ? '+' : ''}
                  {selectedAsset.change}% за год
                </p>
              </div>
            </div>

            <div className="p-10 space-y-8">
              <DialogHeader>
                <DialogTitle className="text-3xl text-zinc-100">Покупка актива</DialogTitle>
              </DialogHeader>

              <div className="h-64">
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart
                    data={[100, 102, 98, 110, 115, 118, 130, 125, 140].map((v) => ({ v }))}
                  >
                    <Line
                      dataKey="v"
                      dot={false}
                      stroke="#a3a3a3"
                      strokeWidth={4}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-zinc-400 mb-2">Количество</p>
                  <div className="flex items-center gap-4">
                    <Button
                      className="border-white/20"
                      onClick={() => {
                        setQuantity(Math.max(1, quantity - 1))
                      }}
                      size="icon"
                      variant="outline"
                    >
                      <Minus className="w-5 h-5" />
                    </Button>
                    <div className="w-32 text-center text-3xl font-bold text-zinc-100 bg-white/5 rounded-xl py-3 border border-white/10">
                      {quantity}
                    </div>
                    <Button
                      className="border-white/20"
                      onClick={() => {
                        setQuantity(quantity + 1)
                      }}
                      size="icon"
                      variant="outline"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <p className="text-zinc-400">Итого к оплате</p>
                  <p className="text-5xl font-bold text-zinc-100">
                    ${(selectedAsset.price * quantity).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-white/10 hover:bg-white/20 text-zinc-200 border border-white/20 text-lg h-14"
                    onClick={onClose}
                  >
                    Отмена
                  </Button>
                  <Button
                    className="flex-1 bg-white/10 hover:bg-white/20 text-zinc-200 border border-white/20 text-lg h-14"
                    onClick={onConfirm}
                  >
                    Купить {quantity} шт.
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function InvestmentsActivity(): React.JSX.Element | null {
  const { buyAsset, player } = useGameStore()
  const [activeTab, setActiveTab] = useState<'stocks' | 'realEstate' | 'metals'>('stocks')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [quantity, setQuantity] = useState(1)

  if (!player) return null

  const handleBuy = () => {
    if (!selectedAsset) return

    buyAsset({
      name: selectedAsset.name,
      price: selectedAsset.price,
      quantity,
      type: activeTab === 'stocks' ? 'stock' : activeTab === 'realEstate' ? 'real_estate' : 'metal',
    })
    setSelectedAsset(null)
  }

  const currentItems = investmentCategories[activeTab].items

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="fixed inset-0 bg-linear-to-br from-zinc-950 via-zinc-900/80 to-zinc-950" />
      <div className="fixed inset-0 backdrop-blur-2xl" />

      <div className="relative z-10 container mx-auto p-6 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-zinc-100 mb-3 flex items-center justify-center gap-4">
            <TrendingUp className="w-12 h-12 text-zinc-600" />
            Инвестиции
          </h1>
          <p className="text-zinc-500 text-lg">Выберите актив и начните приумножать капитал</p>
        </div>

        <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Список активов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentItems.map((asset) => (
            <AssetCard
              asset={asset}
              key={asset.id}
              onSelect={(a) => {
                setSelectedAsset(a)
                setQuantity(1)
              }}
            />
          ))}
        </div>

        <PurchaseDialog
          onClose={() => {
            setSelectedAsset(null)
          }}
          onConfirm={handleBuy}
          quantity={quantity}
          selectedAsset={selectedAsset}
          setQuantity={setQuantity}
        />
      </div>
    </div>
  )
}
