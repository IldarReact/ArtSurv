export interface InvestmentSlice {
  buyAsset: (params: {
    name: string
    type: 'stock' | 'real_estate' | 'metal'
    price: number
    quantity: number
  }) => void
}
