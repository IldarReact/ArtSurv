import { ShoppingCart, Home, Heart, CarFront, Smile } from 'lucide-react'

import type { ShopCategory } from '@/core/types/shop.types'

export const SHOP_CATEGORIES: { id: ShopCategory; label: string; icon: React.ReactNode }[] = [
  { icon: <ShoppingCart className="w-4 h-4" />, id: 'food', label: 'Питание' },
  { icon: <Home className="w-5 h-5" />, id: 'housing', label: 'Жильё' },
  { icon: <CarFront className="w-5 h-5" />, id: 'transport', label: 'Транспорт' },
  { icon: <Heart className="w-4 h-4" />, id: 'health', label: 'Здоровье' },
  { icon: <Smile className="w-4 h-4" />, id: 'services', label: 'Услуги' },
]
