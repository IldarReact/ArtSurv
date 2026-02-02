export type { TurnStep } from '../steps/step.types'

import {
  buffsStep,
  businessStep,
  economyStep,
  educationStep,
  financialStep,
  freelanceStep,
  inflationStep,
  jobsStep,
  lifestyleStep,
  marketStep,
  personalStep,
  thresholdsStep,
} from '../steps/index'
import type { TurnStep } from '../steps/step.types'

export const STEPS: TurnStep[] = [
  economyStep,
  marketStep,
  educationStep,
  jobsStep,
  freelanceStep,
  businessStep,
  buffsStep,
  lifestyleStep,
  personalStep,
  thresholdsStep,
  financialStep,
  inflationStep,
]
