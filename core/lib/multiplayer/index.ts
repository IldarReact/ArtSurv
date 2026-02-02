// core/lib/multiplayer/index.ts
import { createClient, type JsonObject, type Room } from '@liveblocks/client'

import type { GameEvent } from '@/core/types/events.types'

import type { OnlinePlayer as Player } from './multiplayer.types'

interface Presence extends JsonObject {
  color: string
  gameStarted: boolean
  isHost: boolean
  isReady: boolean
  name: string
  selectedArchetype: string | null
  turnReady: boolean
}

const RADIX_36 = 36
const ID_SLICE_START = 2
const ID_SLICE_END = 10
const NAME_SLICE_START = -4

type RoomInstance = Room<
  Presence,
  JsonObject,
  JsonObject,
  GameEvent,
  Record<string, string | number | boolean | undefined>
>

let client: ReturnType<typeof createClient> | null = null
let roomInstance: RoomInstance | null = null

function getClient() {
  if (!client) {
    const publicKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY
    if (!publicKey) {
      // console.warn(
      //   'NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY is not set. Multiplayer features are disabled.',
      // )
      return null
    }
    client = createClient({
      publicApiKey: publicKey,
    })
  }
  return client
}

export function initMultiplayer(inputRoomId?: string, isCreator = false): string {
  const id = inputRoomId ?? Math.random().toString(RADIX_36).slice(ID_SLICE_START, ID_SLICE_END)

  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    url.searchParams.set('room', id)
    window.history.replaceState({}, '', url.toString())
  }

  const HSL_MAX_HUE = 360
  const randomColor = `hsl(${String(Math.random() * HSL_MAX_HUE)}, 70%, 60%)`
  const randomName = `Игрок ${String(Date.now()).slice(NAME_SLICE_START)}`

  const clientInstance = getClient()
  if (!clientInstance) {
    // console.info('[Multiplayer] Liveblocks client not available — multiplayer disabled')
    return id
  }

  const { room } = clientInstance.enterRoom<Presence, JsonObject, JsonObject, GameEvent>(id, {
    initialPresence: {
      color: randomColor,
      gameStarted: false,
      isHost: isCreator,
      isReady: false,
      name: randomName,
      selectedArchetype: null,
      turnReady: false,
    },
  })

  roomInstance = room as unknown as RoomInstance

  return id
}

export const isMultiplayerActive = () => !!roomInstance

export const isHost = (): boolean => {
  if (!roomInstance) return false
  const self = roomInstance.getSelf()
  return self?.presence.isHost ?? false
}

export const getMyConnectionId = () => {
  if (!roomInstance) return null
  const self = roomInstance.getSelf()
  return self ? String(self.connectionId) : null
}

export function getOnlinePlayers(): Player[] {
  if (!roomInstance) return []

  const others = roomInstance.getOthers()
  const self = roomInstance.getSelf()

  const players: Player[] = others.map((other) => ({
    clientId: String(other.connectionId),
    color: other.presence.color,
    gameStarted: other.presence.gameStarted,
    isHost: other.presence.isHost,
    isLocal: false,
    isReady: other.presence.isReady,
    name: other.presence.name,
    selectedArchetype: other.presence.selectedArchetype,
    turnReady: other.presence.turnReady,
  }))

  if (self) {
    players.unshift({
      clientId: String(self.connectionId),
      color: self.presence.color,
      gameStarted: self.presence.gameStarted,
      isHost: self.presence.isHost,
      isLocal: true,
      isReady: self.presence.isReady,
      name: self.presence.name,
      selectedArchetype: self.presence.selectedArchetype,
      turnReady: self.presence.turnReady,
    })
  }

  return players
}

export function setPlayerName(name: string) {
  if (!roomInstance) return
  roomInstance.updatePresence({ name })
}

export function setPlayerReady(ready: boolean) {
  if (!roomInstance) return
  roomInstance.updatePresence({ isReady: ready })
}

export function setTurnReady(ready: boolean) {
  if (!roomInstance) return
  roomInstance.updatePresence({ turnReady: ready })
}

export function setSelectedArchetype(archetype: string | null) {
  if (!roomInstance) return
  roomInstance.updatePresence({ selectedArchetype: archetype })
}

export function startGame() {
  if (!roomInstance) return
  if (!isHost()) {
    // console.warn('Only host can start the game')
    return
  }
  roomInstance.updatePresence({ gameStarted: true })
}

function subscribeToPlayersReady(
  readyField: 'isReady' | 'turnReady',
  callback: (readyCount: number, totalPlayers: number, allReady: boolean) => void,
  includeSelf = true,
): () => void {
  if (!roomInstance)
    return () => {
      /* no-op */
    }

  const handler = () => {
    const players = getOnlinePlayers()
    const readyCount = players.filter((p) => p[readyField]).length
    const totalPlayers = players.length
    const MIN_PLAYERS_FOR_READY = 1
    const allReady = totalPlayers > MIN_PLAYERS_FOR_READY && readyCount === totalPlayers

    callback(readyCount, totalPlayers, allReady)
  }

  const unsubscribeOthers = roomInstance.subscribe('others', handler)
  const unsubscribeSelf = includeSelf
    ? roomInstance.subscribe('my-presence', handler)
    : () => {
        /* no-op */
      }
  handler()

  return () => {
    unsubscribeOthers()
    unsubscribeSelf()
  }
}

export function subscribeToReadyStatus(
  callback: (readyCount: number, totalPlayers: number, allReady: boolean) => void,
): () => void {
  return subscribeToPlayersReady('isReady', callback, false)
}

export function subscribeToTurnReadyStatus(
  callback: (readyCount: number, totalPlayers: number, allReady: boolean) => void,
): () => void {
  return subscribeToPlayersReady('turnReady', callback, true)
}

export function subscribeToGameStart(callback: () => void): () => void {
  if (!roomInstance)
    return () => {
      /* no-op */
    }

  const handler = () => {
    const players = getOnlinePlayers()
    const hostPlayer = players.find((p) => p.isHost)

    if (hostPlayer?.gameStarted) {
      callback()
    }
  }

  const unsubscribe = roomInstance.subscribe('others', handler)
  const unsubscribeSelf = roomInstance.subscribe('my-presence', handler)

  return () => {
    unsubscribe()
    unsubscribeSelf()
  }
}

export function syncTurnAdvance() {
  if (!roomInstance)
    return () => {
      /* no-op */
    }
  return () => {
    /* no-op */
  }
}

export function triggerTurnAdvance() {
  // Не используем
}

export function broadcastEvent(event: GameEvent) {
  if (!roomInstance) return
  roomInstance.broadcastEvent(event)
}

export function subscribeToEvents(callback: (event: GameEvent) => void): () => void {
  if (!roomInstance)
    return () => {
      /* no-op */
    }
  return roomInstance.subscribe('event', ({ event }: { event: GameEvent }) => {
    callback(event)
  })
}

export const getSharedState = () => ({
  getStorage: () => null,
  setStorage: () => {
    // Не используем storage
  },
  subscribeToPresenceChanges: (cb: () => void) => {
    if (!roomInstance)
      return () => {
        /* no-op */
      }
    return roomInstance.subscribe('others', cb)
  },
  subscribeToStorageChanges: (cb: () => void) => {
    if (!roomInstance)
      return () => {
        /* no-op */
      }
    return roomInstance.subscribe('others', cb)
  },
})
