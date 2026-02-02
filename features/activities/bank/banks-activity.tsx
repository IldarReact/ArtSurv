'use client'

import { useState } from 'react'

import { BankStatsGrid } from './components/bank-stats-grid'
import { DepositsSection } from './components/deposits-section'
import { LoansSection } from './components/loans-section'
import { OpenDepositDialog } from './components/open-deposit-dialog'
import { MIN_DEPOSIT_AMOUNT } from './shared-constants'
import { useBank } from './use-bank'
import { useBankViewModel } from './use-bank-view-modal'

export function BanksActivity() {
  const bank = useBank()
  const vm = useBankViewModel()

  const [openDepositModal, setOpenDepositModal] = useState(false)

  if (!bank || !vm) return null

  const handleOpenDeposit = (amount: number) => {
    if (amount < MIN_DEPOSIT_AMOUNT) return
    if (vm.player.stats.money < amount) return

    bank.openDeposit(amount)
    setOpenDepositModal(false)
  }

  return (
    <>
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="relative z-10 container mx-auto p-6 max-w-6xl">
          <BankStatsGrid
            depositRate={vm.depositRate}
            keyRate={vm.keyRate}
            loanRate={vm.loanRate}
            totalDebt={vm.totalDebt}
            totalDeposits={vm.totalDeposits}
          />

          <DepositsSection
            depositRate={vm.depositRate}
            deposits={vm.deposits}
            keyRate={vm.keyRate}
            onOpenDeposit={() => {
              setOpenDepositModal(true)
            }}
            onCloseDeposit={bank.closeDeposit}
          />

          <LoansSection
            debts={vm.debts}
            creditLimit={vm.creditLimit}
            totalDebt={vm.totalDebt}
            onBorrow={bank.borrow}
            onRepay={bank.repay}
          />
        </div>
      </div>

      <OpenDepositDialog
        depositRate={vm.depositRate}
        keyRate={vm.keyRate}
        maxAmount={vm.player.stats.money}
        onClose={() => {
          setOpenDepositModal(false)
        }}
        onConfirm={handleOpenDeposit}
        open={openDepositModal}
      />
    </>
  )
}
