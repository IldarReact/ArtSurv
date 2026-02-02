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
