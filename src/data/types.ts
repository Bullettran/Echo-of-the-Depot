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

/** Эффект употребления предмета: сколько и каких статов восстановить/снять. */
export interface S_ItemUse {
  hunger?: number
  thirst?: number
  hp?: number
}

export interface S_ItemConfig {
  id: string
  name: string
  /** material — ресурсы крафта, consumable — употребляется кликом, component — детали станции. */
  type: 'material' | 'consumable' | 'component'
  /** Вместимость одного слота инвентаря для этого предмета. */
  stack: number
  /** Для consumable: что происходит при употреблении (клик в инвентаре). */
  use?: S_ItemUse
}

export interface S_InvSlot {
  itemId: string
  count: number
}

export interface S_ResourceDrop {
  itemId: string
  count: number
}

export interface S_ResourceConfig {
  id: string
  name: string
  /** Глагол для промпта взаимодействия: «Собрать», «Вскрыть» и т.п. */
  action: string
  /** Ключ текстуры из BootScene. */
  texture: string
  drops: S_ResourceDrop[]
  /** Часов до респауна после истощения (игровых: день = 24 часа = 10 реальных минут). */
  respawnHours: number
}

export interface S_RecipeConfig {
  id: string
  name: string
  /** Затраты: itemId → количество. */
  cost: Record<string, number>
  result: {
    itemId: string
    count: number
  }
}

export interface S_ModuleConfig {
  id: string
  name: string
  /** Глагол промпта («Починить»). */
  action: string
  /** Ключ текстуры из BootScene. */
  texture: string
  /** Чем чинить: предмет и сколько процентов даёт одна единица. */
  repair: {
    itemId: string
    percentPerUnit: number
  }
}

export interface S_StationConfig {
  /** Вклад модуля в общий прогресс станции (сумма = 1). */
  weights: Record<string, number>
  modules: Record<string, S_ModuleConfig>
}
