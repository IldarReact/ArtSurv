import { PiggyBank } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/dialog'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'

interface Props {
  depositRate: number
  keyRate: number
  maxAmount: number
  onClose: () => void
  onConfirm: (amount: number) => void
  open: boolean
}

export function OpenDepositDialog({
  depositRate,
  keyRate,
  maxAmount,
  onClose,
  onConfirm,
  open,
}: Props) {
  const [amount, setAmount] = useState(50_000)

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <PiggyBank className="w-8 h-8 text-emerald-400" />
            Открыть вклад
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Сумма вклада</Label>
            <Input
              onChange={(e) => {
                setAmount(Number(e.target.value))
              }}
              type="number"
              value={amount}
            />
            <p className="text-sm text-zinc-400 mt-2">Доступно: ${maxAmount.toLocaleString()}</p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-400 font-semibold">{depositRate}% годовых</p>
            <p className="text-xs text-zinc-500">Ключевая ставка ЦБ: {keyRate.toFixed(2)}%</p>
          </div>

          <Button
            className="w-full"
            disabled={amount <= 0 || amount > maxAmount}
            onClick={() => {
              onConfirm(amount)
            }}
            size="lg"
          >
            Открыть вклад
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
