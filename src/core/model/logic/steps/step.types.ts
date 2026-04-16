import type { TurnContext } from '../turn/turn-context'
import type { TurnState } from '../turn/turn-state'

export type { TurnContext, TurnState }

export type TurnStep = (ctx: TurnContext, state: TurnState) => void
