export interface OnlinePlayer {
  clientId: string
  color: string
  gameStarted: boolean
  isHost: boolean
  isLocal: boolean
  isReady: boolean
  name: string
  selectedArchetype: string | null
  turnReady: boolean
}
