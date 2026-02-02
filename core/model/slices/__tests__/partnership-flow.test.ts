import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { GameEvent, GameEventType } from '@/core/types/events.types'
import type { GameOffer as CoreGameOffer } from '@/core/types/game-offers.types'

import { createBusinessSlice } from '../activities/work/business/business-slice'
import { createCoreBusinessSlice } from '../activities/work/business/core-business-slice'
import { createGameOffersSlice } from '../activities/work/business/game-offers-slice'
import type { GameOffersSlice, LocalGameState, MockState, GameStore } from '../types'

// Мокируем функции
const mockBroadcastEvent = vi.fn((_event: any) => {
  /* mock */
})

vi.mock('@/core/lib/multiplayer', () => ({
  broadcastEvent: (event: unknown) => {
    mockBroadcastEvent(event)
  },
}))

const mockPushNotification = vi.fn()

let eventHandlers: ((event: { payload?: unknown; type: string }) => void)[] = []

function handleBroadcastEvent(event: { payload?: { toPlayerId?: string }; type: string }) {
  eventHandlers.forEach((handler) => {
    handler(event)
  })
}

function createMockState(initial: Partial<LocalGameState> = {}): MockState {
  let state: LocalGameState = {
    offers: [],
    player: {
      businesses: [],
      id: '',
      name: '',
      stats: { money: 0 },
    },
    turn: 1,
    ...initial,
  }

  const get = () =>
    ({
      ...state,
      performTransaction,
      pushNotification,
    }) as unknown as GameStore

  const set = (
    patch: Partial<LocalGameState> | ((s: LocalGameState) => Partial<LocalGameState>),
  ) => {
    const newState = typeof patch === 'function' ? patch(state) : patch
    state = { ...state, ...newState }
  }

  const on = (
    _eventType: string,
    handler: (event: { payload?: unknown; type: string }) => void,
  ) => {
    eventHandlers.push(handler)
  }

  const pushNotification = vi.fn()

  const performTransaction = (cost: { money?: number }, options?: { requireFunds?: boolean }) => {
    const deltaMoney = cost.money ?? 0
    const requireFunds = options?.requireFunds ?? true

    if (requireFunds && deltaMoney < 0 && state.player.stats.money < Math.abs(deltaMoney)) {
      pushNotification({ title: 'Insufficient funds', type: 'error' })
      return false
    }

    state.player.stats.money += deltaMoney
    if (state.player.personal) {
      state.player.personal.stats.money += deltaMoney
    }
    return true
  }

  return {
    get,
    on,
    performTransaction,
    pushNotification,
    set,
    state: () => state,
  } as unknown as MockState
}

describe('partnership flow', () => {
  let player1State: ReturnType<typeof createMockState>
  let player2State: ReturnType<typeof createMockState>
  let offersSlice1: GameOffersSlice
  let offersSlice2: GameOffersSlice

  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    vi.clearAllMocks()
    mockBroadcastEvent.mockClear()
    mockPushNotification.mockClear()
    eventHandlers = []

    // Настраиваем реализацию мока
    mockBroadcastEvent.mockImplementation(handleBroadcastEvent as unknown as (event: any) => void)

    // 1. Настраиваем состояние для игрока 1 (отправитель)
    player1State = createMockState({
      offers: [],
      player: {
        businesses: [],
        id: 'player_1',
        name: 'Player 1',
        stats: { money: 1000000 },
      },
      turn: 1,
    })

    // 2. Настраиваем состояние для игрока 2 (получатель)
    player2State = createMockState({
      offers: [],
      player: {
        businesses: [],
        id: '1',
        name: 'Player 2',
        stats: { money: 1000000 },
      },
      turn: 1,
    })

    // 3. Создаем срезы для игрока 1
    const coreBusinessSlice1 = createCoreBusinessSlice(
      player1State.set as unknown as Parameters<typeof createCoreBusinessSlice>[0],
      player1State.get as unknown as Parameters<typeof createCoreBusinessSlice>[1],
      {} as unknown as Parameters<typeof createCoreBusinessSlice>[2],
    )

    const businessSlice1 = createBusinessSlice(
      player1State.set as unknown as Parameters<typeof createBusinessSlice>[0],
      player1State.get as unknown as Parameters<typeof createBusinessSlice>[1],
      {
        ...coreBusinessSlice1,
      } as unknown as Parameters<typeof createBusinessSlice>[2],
    )

    offersSlice1 = createGameOffersSlice(
      player1State.set as unknown as Parameters<typeof createGameOffersSlice>[0],
      player1State.get as unknown as Parameters<typeof createGameOffersSlice>[1],
      {
        ...businessSlice1,
        applyStatChanges: (changes: { money?: number }) => {
          const current = player1State.get()
          player1State.set({
            player: {
              ...current.player,
              stats: {
                ...current.player.stats,
                money: current.player.stats.money + (changes.money ?? 0),
              },
            },
          })
        },
        pushNotification: mockPushNotification,
      } as unknown as Parameters<typeof createGameOffersSlice>[2],
    ) as unknown as GameOffersSlice
    player1State.set({
      applyStatChanges: (changes: { money?: number }) => {
        const current = player1State.get()
        player1State.set({
          player: {
            ...current.player,
            stats: {
              ...current.player.stats,
              money: current.player.stats.money + (changes.money ?? 0),
            },
          },
        })
      },
    } as Partial<LocalGameState>)

    // 4. Создаем срезы для игрока 2
    const coreBusinessSlice2 = createCoreBusinessSlice(
      player2State.set as unknown as Parameters<typeof createCoreBusinessSlice>[0],
      player2State.get as unknown as Parameters<typeof createCoreBusinessSlice>[1],
      {} as unknown as Parameters<typeof createCoreBusinessSlice>[2],
    )

    const businessSlice2 = createBusinessSlice(
      player2State.set as unknown as Parameters<typeof createBusinessSlice>[0],
      player2State.get as unknown as Parameters<typeof createBusinessSlice>[1],
      {
        ...coreBusinessSlice2,
      } as unknown as Parameters<typeof createBusinessSlice>[2],
    )

    offersSlice2 = createGameOffersSlice(
      player2State.set as unknown as Parameters<typeof createGameOffersSlice>[0],
      player2State.get as unknown as Parameters<typeof createGameOffersSlice>[1],
      {
        ...businessSlice2,
        applyStatChanges: (changes: { money?: number }) => {
          const current = player2State.get()
          player2State.set({
            player: {
              ...current.player,
              stats: {
                ...current.player.stats,
                money: current.player.stats.money + (changes.money ?? 0),
              },
            },
          })
        },
        pushNotification: mockPushNotification,
      } as unknown as Parameters<typeof createGameOffersSlice>[2],
    ) as unknown as GameOffersSlice
    player2State.set({
      applyStatChanges: (changes: { money?: number }) => {
        const current = player2State.get()
        player2State.set({
          player: {
            ...current.player,
            stats: {
              ...current.player.stats,
              money: current.player.stats.money + (changes.money ?? 0),
            },
          },
        })
      },
    } as Partial<LocalGameState>)

    // 5. Настраиваем обработчики событий
    const handlePlayer1Event = (event: GameEvent | { payload?: any; type: string }) => {
      try {
        const currentState = player1State.get()
        const payload = (event as { payload?: Record<string, any> }).payload
        switch (event.type) {
          case 'OFFER_SENT':
            if (payload?.offer) {
              player1State.set({
                offers: [...currentState.offers, payload.offer as CoreGameOffer],
              })
            }
            break
          case 'BUSINESS_CREATED':
            if (payload?.business) {
              player1State.set({
                player: {
                  ...currentState.player,
                  businesses: [...currentState.player.businesses, payload.business],
                },
              })
            }
            break
          case 'PARTNERSHIP_ACCEPTED':
            offersSlice1.onPartnershipAccepted(
              event as unknown as Parameters<typeof offersSlice1.onPartnershipAccepted>[0],
            )
            break
          case 'PARTNERSHIP_UPDATED':
            offersSlice1.onPartnershipUpdated(
              event as unknown as Parameters<typeof offersSlice1.onPartnershipUpdated>[0],
            )
            break
        }
      } catch (_error) {
        void _error
        // Silently ignore or handle error
      }
    }

    const handlePlayer2Event = (event: GameEvent | { payload?: any; type: string }) => {
      try {
        const currentState = player2State.get()
        const payload = (event as { payload?: Record<string, any> }).payload

        if (event.type === 'OFFER_SENT' && payload?.offer) {
          player2State.set({
            offers: [...currentState.offers, payload.offer as CoreGameOffer],
          })
        }

        if (event.type === 'BUSINESS_CREATED' && payload?.business) {
          player2State.set({
            player: {
              ...currentState.player,
              businesses: [...currentState.player.businesses, payload.business],
            },
          })
        }

        if (event.type === 'PARTNERSHIP_UPDATED') {
          offersSlice2.onPartnershipUpdated(
            event as unknown as Parameters<typeof offersSlice2.onPartnershipUpdated>[0],
          )
        }
      } catch (_error) {
        void _error
        // Silently ignore or handle error
      }
    }

    // Подписываемся на события
    player1State.on(
      '*' as GameEventType,
      handlePlayer1Event as unknown as (event: GameEvent) => void,
    )
    player2State.on(
      '*' as GameEventType,
      handlePlayer2Event as unknown as (event: GameEvent) => void,
    )
  })

  it('создает партнерство между двумя игроками', async () => {
    // 6. Игрок 1 отправляет оффер партнерства
    const testOffer = {
      createdTurn: 1,
      details: {
        businessDescription: 'Продажа товаров',
        businessId: 'biz1',
        businessName: 'Совместный магазин',
        businessType: 'retail' as const,
        employeeRoles: [],
        partnerInvestment: 5000,
        partnerShare: 50,
        totalCost: 10000,
        yourInvestment: 5000,
        yourShare: 50,
      },
      expiresInTurns: 10,
      fromPlayerId: 'player_1',
      fromPlayerName: 'Player 1',
      id: 'test-offer-1',
      status: 'pending' as const,
      toPlayerId: 'player2',
      toPlayerName: 'Player 2',
      type: 'business_partnership' as const,
    }
    // Отправляем предложение
    offersSlice1.sendOffer(
      testOffer.type,
      testOffer.toPlayerId,
      testOffer.toPlayerName,
      testOffer.details as unknown as Parameters<typeof offersSlice1.sendOffer>[3],
      'Давайте откроем магазин вместе!',
    )
    // Проверяем, что предложение было отправлено
    expect(mockBroadcastEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          offer: expect.objectContaining({
            fromPlayerId: testOffer.fromPlayerId,
            toPlayerId: testOffer.toPlayerId,
            type: testOffer.type,
          }),
        },
        type: 'OFFER_SENT',
      }),
    )

    // Даем время на обработку событий
    await new Promise((resolve) => setTimeout(resolve, 50))

    // 7. Проверяем, что оффер был отправлен
    expect(mockBroadcastEvent).toHaveBeenCalled()

    const offerSentEvent = mockBroadcastEvent.mock.calls.find(
      (call: unknown[]) => (call[0] as { type: string }).type === 'OFFER_SENT',
    ) as [{ payload?: { offer?: CoreGameOffer }; type: string }] | undefined
    expect(offerSentEvent).toBeDefined()
    const offer = offerSentEvent?.[0].payload?.offer
    expect(offer).toBeDefined()

    if (!offer) return

    // 8. Очищаем мок перед принятием оффера
    mockBroadcastEvent.mockClear()

    // 9. Игрок 2 принимает оффер
    offersSlice2.acceptOffer(offer.id)

    // 10. Ждем обработки событий
    await new Promise((resolve) => setTimeout(resolve, 50))

    // 11. Проверяем, что события были отправлены
    expect(mockBroadcastEvent).toHaveBeenCalled()

    const acceptanceEvent = mockBroadcastEvent.mock.calls.find(
      (call: unknown[]) => (call[0] as { type: string }).type === 'PARTNERSHIP_ACCEPTED',
    )
    expect(acceptanceEvent).toBeDefined()

    // 12. Проверяем состояние игроков
    const player1FinalState = player1State.get()
    const player2FinalState = player2State.get()

    // Проверяем, что у обоих игроков есть по одному бизнесу
    expect(player1FinalState.player.businesses).toHaveLength(1)
    expect(player2FinalState.player.businesses).toHaveLength(1)

    // Проверяем, что бизнесы связаны
    const player1Business = player1FinalState.player.businesses[0]
    const player2Business = player2FinalState.player.businesses[0]
    expect(player1Business.partnerBusinessId).toBe(player2Business.id)
    expect(player2Business.partnerBusinessId).toBe(player1Business.id)

    // Проверяем, что деньги списались с обоих игроков
    expect(player1FinalState.player.stats.money).toBe(995000) // 1,000,000 - 5,000
    expect(player2FinalState.player.stats.money).toBe(995000) // 1,000,000 - 5,000
  })
})
