export type LifeEventCategory = 'education' | 'family' | 'investments' | 'rest' | 'work'

export type LifeEventKind =
  | 'asset_purchased'
  | 'asset_sold'
  | 'business_quarter'
  | 'child_born'
  | 'course_completed'
  | 'family_member_added'
  | 'family_member_removed'
  | 'job_lost'
  | 'job_quit'
  | 'job_salary_increased'
  | 'job_started'
  | 'partner_met'
  | 'relationship_started'
  | 'rest_performed'
  | 'university_completed'
  | 'work_quarter'

export type LifeEventStat = 'energy' | 'happiness' | 'health' | 'intelligence' | 'sanity'

export interface LifeEvent {
  amount?: number
  category: LifeEventCategory
  costBasis?: number
  entityName?: string
  gainOrLoss?: number
  id: string
  kind: LifeEventKind
  statChanges?: Partial<Record<LifeEventStat, number>>
  turn: number
  year: number
}
