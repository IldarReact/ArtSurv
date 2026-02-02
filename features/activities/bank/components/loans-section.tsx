import { CreditCard, Plus, Minus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'
import { Input } from '@/shared/components/input'

interface Debt {
  id: string
  interestRate: number
  name: string
  quarterlyPayment: number
  remainingAmount: number
  remainingQuarters: number
  type: string
}

interface Props {
  debts: Debt[]
  creditLimit: number
  totalDebt: number
  onBorrow: (amount: number) => void
  onRepay: (amount: number) => void
}

export function LoansSection({ creditLimit, debts, onBorrow, onRepay, totalDebt }: Props) {
  const [borrowAmount, setBorrowAmount] = useState<string>('')
  const [repayAmount, setRepayAmount] = useState<string>('')

  const availableLimit = Math.max(0, creditLimit - totalDebt)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-red-400" />
          Кредитование
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Блок получения кредита */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-xl font-bold mb-2">Доступный лимит</h3>
            <p className="text-4xl font-bold text-emerald-400 mb-6">
              ${availableLimit.toLocaleString()}
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Сумма к получению</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={borrowAmount}
                  onChange={(e) => {
                    setBorrowAmount(e.target.value)
                  }}
                  className="bg-zinc-900 border-white/10"
                />
              </div>
              <Button
                onClick={() => {
                  onBorrow(Number(borrowAmount))
                  setBorrowAmount('')
                }}
                disabled={
                  !borrowAmount ||
                  Number(borrowAmount) <= 0 ||
                  Number(borrowAmount) > availableLimit
                }
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Взять кредит
              </Button>
            </div>
          </Card>

          {/* Блок погашения */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-xl font-bold mb-2">Ваша задолженность</h3>
            <p className="text-4xl font-bold text-red-400 mb-6">${totalDebt.toLocaleString()}</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Сумма погашения</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={repayAmount}
                  onChange={(e) => {
                    setRepayAmount(e.target.value)
                  }}
                  className="bg-zinc-900 border-white/10"
                />
              </div>
              <Button
                onClick={() => {
                  onRepay(Number(repayAmount))
                  setRepayAmount('')
                }}
                disabled={!repayAmount || Number(repayAmount) <= 0 || totalDebt <= 0}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
              >
                <Minus className="w-4 h-4 mr-2" />
                Погасить часть
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Список активных долгов */}
      {debts.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Активные обязательства</h3>
          <div className="grid gap-4">
            {debts.map((d) => (
              <Card
                className="bg-red-500/10 border-red-500/30 p-6 flex justify-between items-center"
                key={d.id}
              >
                <div>
                  <h4 className="text-xl font-bold text-red-400">{d.name}</h4>
                  <p className="text-zinc-400">
                    Ставка: {d.interestRate}% • Остаток: ${d.remainingAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-400">Платёж в квартал</p>
                  <p className="text-2xl font-bold text-red-400">
                    ${d.quarterlyPayment.toLocaleString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
