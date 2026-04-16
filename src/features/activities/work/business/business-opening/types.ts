export interface BusinessRequirement {
  description: string
  icon: React.ReactNode
  priority: 'required' | 'recommended' | 'optional'
  role: string
}

export interface BusinessOption {
  businessType: string
  cost: number
  description: string
  energyCost: number
  expenses: string
  id: string
  image: string
  income: string
  maxEmployees: number
  monthlyExpenses: number
  monthlyIncome: number
  requirements: BusinessRequirement[]
  stressImpact: number
  title: string
  type: string
}

export interface BusinessOpeningDialogProps {
  isOpen: boolean
  onClose: () => void
  onOpenBusiness: (businessId: string) => void
  playerCash: number
}
