import { z } from 'zod'

export const LifeEventSchema = z
  .object({
    amount: z.number().finite().optional(),
    category: z.enum(['education', 'family', 'investments', 'rest', 'work']),
    costBasis: z.number().finite().min(0).optional(),
    entityName: z.string().optional(),
    gainOrLoss: z.number().finite().optional(),
    id: z.string().min(1),
    kind: z.enum([
      'asset_purchased',
      'asset_sold',
      'business_quarter',
      'child_born',
      'course_completed',
      'family_member_added',
      'family_member_removed',
      'job_lost',
      'job_quit',
      'job_salary_increased',
      'job_started',
      'partner_met',
      'relationship_started',
      'rest_performed',
      'university_completed',
      'work_quarter',
    ]),
    statChanges: z
      .object({
        energy: z.number().finite().optional(),
        happiness: z.number().finite().optional(),
        health: z.number().finite().optional(),
        intelligence: z.number().finite().optional(),
        sanity: z.number().finite().optional(),
      })
      .strict()
      .optional(),
    turn: z.number().int().min(0),
    year: z.number().int().min(0),
  })
  .strict()
