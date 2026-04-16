import { PiggyBank, Plus, X } from 'lucide-react'

import { Button } from '@/shared/components/button'
import { Card } from '@/shared/components/card'

interface Deposit {
  currentValue: number
  id: string
  name: string
}

interface Props {
  depositRate: number
  deposits: Deposit[]
  keyRate: number
  onOpenDeposit: () => void
  onCloseDeposit: (id: string) => void
}

export function DepositsSection({
  depositRate,
  deposits,
  keyRate,
  onCloseDeposit,
  onOpenDeposit,
}: Props) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <PiggyBank className="w-8 h-8 text-emerald-400" />
          Вклады
        </h2>
        <Button onClick={onOpenDeposit} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Открыть вклад
        </Button>
      </div>

      {deposits.length === 0 ? (
        <Card className="bg-white/5 border-dashed border-white/20 p-16 text-center">
          <PiggyBank className="w-20 h-20 mx-auto mb-4 text-zinc-600" />
          <p className="text-xl text-zinc-500">У вас пока нет вкладов</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deposits.map((d) => (
            <Card
              className="bg-emerald-500/5 border-emerald-500/20 p-6 flex justify-between items-center"
              key={d.id}
            >
              <div>
                <h3 className="text-xl font-semibold">{d.name}</h3>
                <p className="text-zinc-400">
                  {depositRate}% • ставка ЦБ {keyRate.toFixed(2)}%
                </p>
                <p className="text-3xl font-bold text-emerald-400 mt-2">
                  ${d.currentValue.toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onCloseDeposit(d.id)
                }}
                className="text-zinc-500 hover:text-red-400"
                aria-label="Закрыть"
              >
                <X className="w-6 h-6" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
