// features/activities/bank/use-bank.ts
import { useGameStore } from '@/core/model/store'

export function useBank() {
  const player = useGameStore((s) => s.player)
  const openDeposit = useGameStore((s) => s.openDeposit)
  const closeDeposit = useGameStore((s) => s.closeDeposit)
  const borrow = useGameStore((s) => s.borrow)
  const repay = useGameStore((s) => s.repay)

  if (!player) return null

  return {
    borrow,
    closeDeposit,
    openDeposit,
    player,
    repay,
  }
}
