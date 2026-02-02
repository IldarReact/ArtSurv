export interface CategoryCardProps {
  count: string
  icon: React.ReactNode
  image: string
  onClick: () => void
  title: string
}

export interface DetailCardProps {
  details?: { label: string; value: string }[]
  image: string
  isRed?: boolean
  subtitle: string
  tags?: string[]
  title: string
}

export interface FamilyMember {
  age: number
  job?: string
  name: string
}

export interface Asset {
  image: string
  loan?: number
  monthly: number
  mortgage?: number
  name: string
  value: number
}

export interface Debt {
  minPayment: number
  name: string
  rate: number
  remainingAmount: number
}

export interface Saving {
  amount: number
  name: string
  type: string
}

export interface Investment {
  amount: number
  name: string
  type: string
}

export interface CharacterDetailedInfo {
  assets: Asset[]
  debts: Debt[]
  family: {
    spouse: FamilyMember
    children: Pick<FamilyMember, 'name' | 'age'>[]
    pet: { name: string; type: string }
  }
  investments: Investment[]
  savings: Saving[]
}

export type ModalView = 'main' | 'family' | 'assets' | 'debts' | 'savings' | 'investments'
