'use client'

import { Link as LinkIcon } from 'lucide-react'

import { Button } from '@/shared/components/button'

interface LobbyHeaderProps {
  onCopyLink: () => void
  roomId: string
}

export function LobbyHeader({ onCopyLink, roomId }: LobbyHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Лобби</h1>
        <p className="text-slate-500 text-sm">
          Комната: <span className="font-mono text-slate-300">{roomId}</span>
        </p>
      </div>
      <Button
        className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
        onClick={onCopyLink}
        variant="outline"
      >
        <LinkIcon className="w-4 h-4 mr-2" />
        Пригласить
      </Button>
    </div>
  )
}
