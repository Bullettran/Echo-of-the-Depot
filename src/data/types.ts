export enum E_TimePhase {
  Dawn = 'dawn',
  Day = 'day',
  Dusk = 'dusk',
  Night = 'night',
}

export enum E_StatType {
  Hp = 'hp',
  Hunger = 'hunger',
  Thirst = 'thirst',
}

export enum E_ConditionId {
  Starving = 'starving',
  Dehydrated = 'dehydrated',
  CarrierRestart = 'carrier-restart',
}

export interface S_StatsSnapshot {
  hp: number
  hunger: number
  thirst: number
}

export interface S_StatsConfig {
  start: S_StatsSnapshot
  max: S_StatsSnapshot
  decayPerHour: {
    hunger: number
    thirst: number
  }
}

export interface S_EffectConfig {
  id: E_ConditionId
  name: string
  /** Урон HP в игровой час (отрицательное число). */
  hpPerHour?: number
  /** Длительность в игровых часах; null/undefined = пока активно условие-источник. */
  durationHours?: number
  /** Потолок всех статов в % от максимума, пока условие активно. */
  statCapPercent?: number
}

export interface S_ConditionView {
  id: string
  name: string
  remainingHours: number | null
}
