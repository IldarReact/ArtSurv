// src/types/housing.types.ts
import type { StatEffect } from './stats.types'

/**
 * Тип владения жильём
 */
export type HousingOwnershipType =
  | 'rent' // Аренда — платим rentCostPerQuarter
  | 'mortgage' // Ипотека — платим rentCostPerQuarter + владеем
  | 'own' // Полностью своё — только maintenance

/**
 * Физический тип жилья (для иконок, фильтров и визуала)
 */
export type HousingSubType =
  | 'studio'
  | 'apartment'
  | 'townhouse'
  | 'house'
  | 'penthouse'
  | 'villa'
  | 'favela_house'
  | 'khrushchevka'
  | 'communal'
  | 'cottage'
  | 'mansion'

/**
 * Строящийся рядом объект — главная инвестиционная фича
 */
export interface NearbyConstruction {
  attractivenessBonus: number // На сколько % вырастет привлекательность жилья после завершения
  buildTime: number // Сколько кварталов всего строится
  currentProgress: number // От 0 до buildTime (обновляется каждый ход)
  effectDuringConstruction: StatEffect // Эффекты пока идёт стройка (обычно негативные)
  effectOnCompletion: StatEffect // Постоянные бонусы после завершения
  id: string // Уникальный ID стройки
  name: string // "Метро", "Больница", "ТЦ", "Завод"
}

/**
 * Основной объект недвижимости в игре
 */
export interface HousingOption {
  attractiveness: number // Привлекательность 0–100 — влияет на цену и желание купить
  capacity: number // Сколько человек может жить
  description: string // Подробное описание

  effects: StatEffect // Постоянные эффекты на статы персонажа (святая святых)
  id: string // Уникальный идентификатор

  imageUrl?: string // Фото / иконка для карточки
  isOwnedByPlayer?: boolean // Уже куплено игроком (для инвентаря)
  isRentable: boolean // Можно ли сдавать в субаренду?

  maintenanceCost: number // Обязательные расходы на содержание (коммуналка, ремонт, налог)
  marketValue: number // Текущая рыночная стоимость (меняется со временем!)

  name: string // Название для игрока
  nearbyConstructions: NearbyConstruction[] // Строящиеся рядом объекты — причина роста цены

  rentalIncomePerQuarter: number // Сколько получаем за квартал при сдаче
  rentCostPerQuarter: number // Платёж за квартал (аренда или ипотека). 0 — если своё

  subtype: HousingSubType // Физический тип (квартира, дом, хрущёвка и т.д.)
  type: HousingOwnershipType // Как владеем: аренда / ипотека / своё
  yearBuilt?: number // Год постройки — влияет на maintenance и attractiveness
}
