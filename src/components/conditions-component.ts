import type { EventBus, GameEventMap } from '../core/event-bus'
import { E_ConditionId, type S_ConditionView, type S_EffectConfig } from '../data/types'

interface ActiveEntry {
  config: S_EffectConfig
  remainingHours: number | null
}

/**
 * Активные состояния инженера (дебаффы). Чистый TS, без Phaser.
 * Источник правды по конфигам — data/effects.json.
 */
export class ConditionsComponent {
  private readonly bus: EventBus<GameEventMap>
  private readonly configs: Record<E_ConditionId, S_EffectConfig>
  private readonly active = new Map<E_ConditionId, ActiveEntry>()

  constructor(bus: EventBus<GameEventMap>, configs: Record<E_ConditionId, S_EffectConfig>) {
    this.bus = bus
    this.configs = configs
  }

  activate(id: E_ConditionId): void {
    if (this.active.has(id)) return
    const config = this.configs[id]
    if (!config) throw new Error(`Unknown condition: ${id}`)
    this.active.set(id, { config, remainingHours: config.durationHours ?? null })
    this.emitChanged()
  }

  deactivate(id: E_ConditionId): void {
    if (!this.active.delete(id)) return
    this.emitChanged()
  }

  tick(dtHours: number): void {
    let changed = false
    for (const [id, entry] of [...this.active]) {
      if (entry.remainingHours === null) continue
      entry.remainingHours -= dtHours
      if (entry.remainingHours <= 0) {
        this.active.delete(id)
        changed = true
      }
    }
    if (changed) this.emitChanged()
  }

  isActive(id: E_ConditionId): boolean {
    return this.active.has(id)
  }

  /** Минимальный потолок статов среди активных условий, % (100 — без ограничений). */
  getStatCapPercent(): number {
    let cap = 100
    for (const entry of this.active.values()) {
      cap = Math.min(cap, entry.config.statCapPercent ?? 100)
    }
    return cap
  }

  /** Суммарное изменение HP за игровой час (отрицательное = урон). */
  getHpDrainPerHour(): number {
    let drain = 0
    for (const entry of this.active.values()) {
      drain += entry.config.hpPerHour ?? 0
    }
    return drain
  }

  private emitChanged(): void {
    const active: S_ConditionView[] = [...this.active.values()].map((entry) => ({
      id: entry.config.id,
      name: entry.config.name,
      remainingHours: entry.remainingHours,
    }))
    this.bus.emit('conditions:changed', { active })
  }
}
