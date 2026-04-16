export type CoreStat = 'money' | 'happiness' | 'energy' | 'health' | 'sanity' | 'intelligence'

export interface Stats {
  energy: number
  happiness: number
  health: number
  intelligence: number
  money: number
  sanity: number
}

export type StatEffect = Partial<Stats>

export type StatChangeKind = 'one_time' | 'temporary' | 'persistent'

export interface OneTimeStatChangeEffect {
  effects: StatEffect
  kind: 'one_time'
}

export interface TemporaryStatChangeEffect {
  durationMonths: number
  effects: StatEffect
  kind: 'temporary'
}

export interface PersistentStatChangeEffect {
  effects: StatEffect
  isActive: boolean
  kind: 'persistent'
  sourceId: string
}

export type StatChangeEffect =
  | OneTimeStatChangeEffect
  | TemporaryStatChangeEffect
  | PersistentStatChangeEffect
