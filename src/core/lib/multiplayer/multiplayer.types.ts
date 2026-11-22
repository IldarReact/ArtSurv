export interface OnlinePlayer {
  clientId: string
  color: string
  finalScore: number | null
  gameStarted: boolean
  isHost: boolean
  isLocal: boolean
  isReady: boolean
  name: string
  selectedArchetype: string | null
  turnReady: boolean
}
