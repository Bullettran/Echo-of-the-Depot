import type { S_InvSlot, S_StatsSnapshot } from '../data/types'

export interface S_NodeSaveState {
  configId: string
  IsDepleted: boolean
  remainingHours: number
}

/** Схема сейва. При изменении структуры — поднять версию и написать миграцию в load(). */
export interface S_SaveData {
  schemaVersion: 1
  /** Всего прошедших игровых часов (TimeSystem). */
  timeHours: number
  stats: S_StatsSnapshot
  inventory: S_InvSlot[]
  nodes: S_NodeSaveState[]
  /** Проценты модулей станции (W2.1), опционально для совместимости старых сейвов. */
  station?: Record<string, number>
}

const KEY = 'eotd-save-v1'

/**
 * Сейв в localStorage (ключ 'eotd-save-v1', JSON, версия схемы).
 * Storage инжектится — в тестах подставляется in-memory двойник.
 */
export class SaveSystem {
  private readonly storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

  /** @param storage — по умолчанию window.localStorage (в тестах — мок). */
  constructor(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>) {
    this.storage = storage
  }

  /** Прочитать сейв; null если его нет или схема чужой версии (миграции — в этом методе). */
  load(): S_SaveData | null {
    const raw = this.storage.getItem(KEY)
    if (!raw) return null
    try {
      const data = JSON.parse(raw) as S_SaveData
      if (data.schemaVersion !== 1) return null
      return data
    } catch {
      // битый JSON — считаем сейва нет, не падаем
      return null
    }
  }

  /** Записать сейв (переписывает предыдущий). */
  save(data: S_SaveData): void {
    this.storage.setItem(KEY, JSON.stringify(data))
  }

  /** Стереть сейв (сброс прогресса). */
  clear(): void {
    this.storage.removeItem(KEY)
  }
}
