'use client'

import { useGameStore } from '@/core/model/store'

export function YearReportModal() {
  const { closeYearReport, gameStatus, history } = useGameStore()

  if (gameStatus !== 'year_report') return null

  const lastSnapshot = history.length > 0 ? history[history.length - 1] : undefined

  const handleClose = (): void => {
    closeYearReport()
  }

  if (lastSnapshot === undefined) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <h2 className="text-xl font-bold mb-4">Данные за прошедший год отсутствуют</h2>
          <button
            className="w-full px-4 py-2 bg-accent text-white rounded hover:opacity-90 transition"
            onClick={handleClose}
          >
            ПРОДОЛЖИТЬ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-card border border-border rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-foreground mb-6 uppercase">
          Отчет за {lastSnapshot.year} год
        </h2>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Ход</p>
            <p className="text-2xl font-bold">{lastSnapshot.turn}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Чистая стоимость</p>
            <p className="text-2xl font-bold">${lastSnapshot.netWorth.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Счастье</p>
            <p className="text-2xl font-bold">{lastSnapshot.happiness}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Здоровье</p>
            <p className="text-2xl font-bold">{lastSnapshot.health}</p>
          </div>
        </div>

        <button
          className="w-full px-4 py-3 bg-accent text-white rounded hover:opacity-90 transition font-semibold"
          onClick={handleClose}
        >
          ПРОДОЛЖИТЬ
        </button>
      </div>
    </div>
  )
}
