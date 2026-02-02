import type { StateCreator } from 'zustand'

import type { GameStore } from '../../types'
import type { RelocationSlice } from '../../types/relocation.types'

const RELOCATION_COST = 5000

export const createRelocationSlice: StateCreator<GameStore, [], [], RelocationSlice> = (
  set,
  get,
) => ({
  relocateToCountry: (countryId) => {
    const state = get()
    if (!state.player) return

    const country = state.countries[countryId]

    // 1. Пытаемся списать деньги за переезд
    if (
      !state.performTransaction({ money: -RELOCATION_COST }, { title: `Переезд в ${country.name}` })
    ) {
      return
    }

    // 2. Обновляем страну игрока
    state.updatePlayer({
      countryId: country.id,
    })

    state.pushNotification({
      message: `Вы успешно переехали в ${country.name}. Налоги и стоимость жизни теперь соответствуют новой стране.`,
      title: 'Добро пожаловать!',
      type: 'success',
    })
  },
})
