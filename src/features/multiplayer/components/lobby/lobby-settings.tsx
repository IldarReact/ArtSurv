'use client'

import { Globe, User } from 'lucide-react'

interface LobbySettingsProps {
  onOpenArchetypeModal: () => void
  onOpenCountryModal: () => void
  selectedArchetype: string | null
  selectedArchetypeName: string
  selectedCountryName: string
}

export function LobbySettings({
  onOpenArchetypeModal,
  onOpenCountryModal,
  selectedArchetype,
  selectedArchetypeName,
  selectedCountryName,
}: LobbySettingsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Карточка выбора страны */}
      <button
        className="bg-slate-900 rounded-xl p-6 border border-slate-800 cursor-pointer hover:border-slate-600 transition-colors group text-left w-full"
        onClick={onOpenCountryModal}
        type="button"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <Globe className="w-5 h-5 text-slate-400 group-hover:text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400">Страна</h3>
              <p className="text-lg font-bold text-white">{selectedCountryName}</p>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-400 group-hover:text-white px-3 py-1 rounded-md hover:bg-slate-800 transition-colors">
            Изменить
          </div>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 w-full" />
        </div>
      </button>

      {/* Карточка выбора персонажа */}
      <button
        className="bg-slate-900 rounded-xl p-6 border border-slate-800 cursor-pointer hover:border-slate-600 transition-colors group text-left w-full"
        onClick={onOpenArchetypeModal}
        type="button"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <User className="w-5 h-5 text-slate-400 group-hover:text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400">Персонаж</h3>
              <p className="text-lg font-bold text-white">{selectedArchetypeName}</p>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-400 group-hover:text-white px-3 py-1 rounded-md hover:bg-slate-800 transition-colors">
            Изменить
          </div>
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full w-full transition-all ${selectedArchetype ? 'bg-purple-500' : 'bg-transparent'}`}
          />
        </div>
      </button>
    </div>
  )
}
