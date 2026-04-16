export interface IdeaSlice {
  developIdea: (ideaId: string, investment: number) => void
  discardIdea: (ideaId: string) => void
  // Actions
  generateIdea: () => void
  launchBusinessFromIdea: (ideaId: string) => void
}
