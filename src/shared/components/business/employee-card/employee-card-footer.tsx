import React from 'react'

import { Button } from '@/shared/components/button'
import { CardFooter } from '@/shared/components/card'
import { cn } from '@/shared/utils/utils'

interface EmployeeCardFooterProps {
  actionIcon?: React.ReactNode
  actionLabel?: string
  actionVariant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost'
  canAfford?: boolean
  isSelected?: boolean
  onAction?: () => void
  onSecondaryAction?: () => void
  onTertiaryAction?: () => void
  secondaryActionIcon?: React.ReactNode
  secondaryActionLabel?: string
  tertiaryActionIcon?: React.ReactNode
  tertiaryActionLabel?: string
}

export const EmployeeCardFooter: React.FC<EmployeeCardFooterProps> = ({
  actionIcon,
  actionLabel,
  actionVariant = 'default',
  canAfford = true,
  isSelected = false,
  onAction,
  onSecondaryAction,
  onTertiaryAction,
  secondaryActionIcon,
  secondaryActionLabel,
  tertiaryActionIcon,
  tertiaryActionLabel,
}) => {
  if (!onAction && !onSecondaryAction && !onTertiaryAction) return null

  return (
    <CardFooter className="p-6 pt-0 mt-auto flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 w-full">
        <div className="flex gap-2 w-full">
          {onSecondaryAction && (
            <Button
              className="flex-1 h-10 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider transition-all"
              onClick={(e) => {
                e.stopPropagation()
                onSecondaryAction()
              }}
              variant="outline"
            >
              {secondaryActionIcon && <span className="mr-1">{secondaryActionIcon}</span>}
              {secondaryActionLabel}
            </Button>
          )}
          {onTertiaryAction && (
            <Button
              className="flex-1 h-10 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider transition-all"
              onClick={(e) => {
                e.stopPropagation()
                onTertiaryAction()
              }}
              variant="outline"
            >
              {tertiaryActionIcon && <span className="mr-1">{tertiaryActionIcon}</span>}
              {tertiaryActionLabel}
            </Button>
          )}
        </div>
        {onAction && (
          <Button
            className={cn(
              'w-full h-11 rounded-lg font-black text-xs uppercase tracking-widest transition-all shadow-lg',
              actionVariant === 'default' &&
                'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20',
              actionVariant === 'secondary' &&
                'bg-green-600 hover:bg-green-500 text-white shadow-green-500/20',
              actionVariant === 'destructive' &&
                'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20',
              !canAfford && !isSelected && 'opacity-50 grayscale cursor-not-allowed',
            )}
            disabled={!canAfford && !isSelected}
            onClick={(e) => {
              e.stopPropagation()
              onAction()
            }}
            variant={actionVariant}
          >
            {actionIcon && <span className="mr-2">{actionIcon}</span>}
            {actionLabel}
          </Button>
        )}
      </div>
    </CardFooter>
  )
}
