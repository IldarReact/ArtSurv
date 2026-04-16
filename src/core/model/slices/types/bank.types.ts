export interface BankSlice {
  openDeposit: (amount: number) => void
  closeDeposit: (id: string) => void
  borrow: (amount: number) => void
  repay: (amount: number) => void
}
