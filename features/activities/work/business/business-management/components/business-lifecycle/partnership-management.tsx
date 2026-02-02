'use client'

import { Users } from 'lucide-react'
import React from 'react'

import { canMakeDirectChanges, requiresApproval } from '@/core/lib/business/partnership-permissions'
import type { Business, Player } from '@/core/types'
import { Badge } from '@/shared/components/badge'

interface PartnershipManagementProps {
  business: Business
  player: Player | null
  playerShare: number
}

export function PartnershipManagement({
  business,
  player,
  playerShare,
}: PartnershipManagementProps) {
  if (business.partners.length === 0) return null

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-400" />
        Партнеры и владение
      </h3>

      {/* Статус контроля */}
      <div className="mb-4 p-4 bg-white/5 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Ваша доля</p>
            <p className="text-3xl font-bold text-white">{playerShare}%</p>
          </div>
          <div className="text-right">
            {player && canMakeDirectChanges(business, player.id) ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                ✓ Полный контроль
              </Badge>
            ) : player && requiresApproval(business, player.id) ? (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                ⚠ Требуется согласование
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                ✗ Только просмотр
              </Badge>
            )}
            <p className="text-xs text-white/40 mt-1">
              {player && canMakeDirectChanges(business, player.id)
                ? 'Вы можете вносить изменения напрямую (> 50%)'
                : player && requiresApproval(business, player.id)
                  ? 'Изменения требуют одобрения партнёра (= 50%)'
                  : 'Вы не можете вносить изменения (< 50%)'}
            </p>
          </div>
        </div>
      </div>

      {/* Список партнеров */}
      <div className="space-y-2 mb-4">
        <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">Владельцы:</p>
        {business.partners.map((partner) => (
          <div
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            key={partner.id}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${partner.type === 'player' ? 'bg-blue-400' : 'bg-gray-400'}`}
              />
              <div>
                <p className="font-medium text-white">{partner.name}</p>
                <p className="text-xs text-white/40">
                  {partner.type === 'player' ? 'Вы' : 'NPC'} • Вложено: $
                  {partner.investedAmount.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">{partner.share}%</p>
              {partner.type === 'npc' && (
                <p className="text-xs text-white/40">Отношение: {partner.relation}/100</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* История голосований */}
      {business.proposals.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">
            Последние предложения:
          </p>
          <div className="space-y-2">
            {business.proposals
              .slice(-3)
              .reverse()
              .map((proposal) => (
                <div className="p-3 bg-white/5 rounded-lg border border-white/5" key={proposal.id}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {proposal.changeType === 'price' &&
                          `Изменение цены на ${String(proposal.data.newPrice)}`}
                        {proposal.changeType === 'quantity' &&
                          `Изменение производства на ${String(proposal.data.newQuantity)}`}
                        {proposal.changeType === 'branch' && 'Открытие филиала'}
                        {proposal.changeType === 'dividend' &&
                          `Вывод дивидендов $${String(proposal.data.amount)}`}
                      </p>
                      <p className="text-xs text-white/40">
                        Квартал {new Date(proposal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      className={
                        proposal.status === 'approved'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : proposal.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }
                    >
                      {proposal.status === 'approved' && '✓ Одобрено'}
                      {proposal.status === 'rejected' && '✗ Отклонено'}
                      {proposal.status === 'pending' && '⏳ На рассмотрении'}
                    </Badge>
                  </div>
                  {/* Детали голосования */}
                  <div className="flex gap-1 mt-2">
                    {proposal.votes &&
                      Object.entries(proposal.votes).map(([partnerId, vote]) => {
                        const partner = business.partners.find((p) => p.id === partnerId)
                        if (!partner) return null
                        return (
                          <div
                            className={`px-2 py-1 rounded text-xs ${
                              vote ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}
                            key={partnerId}
                            title={`${partner.name}: ${vote ? 'ЗА' : 'ПРОТИВ'} (${String(partner.share)}%)`}
                          >
                            {partner.name.split(' ')[0]}: {vote ? '👍' : '👎'}
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
