export interface RestActivity {
  bg: string
  color: string
  cost: number
  effects: {
    happiness?: number
    health?: number
    sanity?: number
    intelligence?: number
    energy?: number
  }
  energyCost: number
  icon: string
  id: string
  title: string
}
