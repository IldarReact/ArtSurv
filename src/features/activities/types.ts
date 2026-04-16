export interface ActivityAction {
  label: string
  onClick: () => void
}

export interface ActivityStat {
  label: string
  value: string | number
}

export interface ActivityCard {
  actions: ActivityAction[]
  description: string
  id: string
  image: string
  stats: ActivityStat[]
  subtitle: string
  title: string
}

export interface ActivityGridProps {
  cards: ActivityCard[]
}
