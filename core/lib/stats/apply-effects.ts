import type { StatEffect, Stats } from '@/core/types/stats.types'

/**
 * Универсальный помощник для применения эффектов статов к объекту модификаторов.
 * Поддерживает сложение и вычитание.
 */
export function applyStatEffects(
  target: Partial<Stats>,
  effects: StatEffect,

  operation: 'add' | 'subtract' = 'add',
) {
  const keys: (keyof StatEffect)[] = ['energy', 'health', 'sanity', 'happiness', 'intelligence']

  keys.forEach((key) => {
    const val = effects[key]
    if (typeof val === 'number' && Number.isFinite(val)) {
      const current = target[key] ?? 0
      target[key] = operation === 'add' ? current + val : current - val
    }
  })
}
