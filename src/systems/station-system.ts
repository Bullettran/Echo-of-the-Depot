import type { EventBus, GameEventMap } from '../core/event-bus'
import type { S_StationConfig } from '../data/types'
import { InventoryComponent } from '../components/inventory-component'

/**
 * Агрегатор станции-депо: проценты модулей, взвешенный общий прогресс, финал.
 * Чистый TS (аналог BPC_StationModules из UE-плана): ремонт валидирует и списывает
 * ремкомплекты из инвентаря; при 100% всех ключевых модулей — 'station:completed'.
 */
export class StationSystem {
  private readonly bus: EventBus<GameEventMap>
  private readonly config: S_StationConfig
  private readonly inventory: InventoryComponent
  private readonly percents = new Map<string, number>()
  private completedEmitted = false

  constructor(bus: EventBus<GameEventMap>, config: S_StationConfig, inventory: InventoryComponent) {
    this.bus = bus
    this.config = config
    this.inventory = inventory
    for (const moduleId of Object.keys(config.modules)) {
      this.percents.set(moduleId, 0)
    }
  }

  /** Текущий процент модуля 0..1. */
  getPercent(moduleId: string): number {
    return this.percents.get(moduleId) ?? 0
  }

  /** Взвешенный общий прогресс станции 0..1. */
  get totalPercent(): number {
    let total = 0
    for (const [moduleId, weight] of Object.entries(this.config.weights)) {
      total += weight * this.getPercent(moduleId)
    }
    return total
  }

  /**
   * Ремонт: списать 1 ремкомплект, поднять процент модуля на percentPerUnit.
   * @returns успех; без предмета — 'station:repairFailed' и ничего не меняется.
   * Эмитит 'station:moduleChanged', 'station:progress', при полном ремонте — 'station:completed' (один раз).
   */
  repair(moduleId: string): boolean {
    const module = this.config.modules[moduleId]
    if (!module) return false
    if (this.getPercent(moduleId) >= 1) return false

    if (this.inventory.count(module.repair.itemId) < 1) {
      this.bus.emit('station:repairFailed', { itemId: module.repair.itemId, count: 1 })
      return false
    }
    this.inventory.remove(module.repair.itemId, 1)

    const percent = Math.min(1, this.getPercent(moduleId) + module.repair.percentPerUnit / 100)
    this.percents.set(moduleId, percent)

    this.bus.emit('station:moduleChanged', { moduleId, percent })
    this.bus.emit('station:progress', { percent: this.totalPercent })

    if (this.totalPercent >= 1 && !this.completedEmitted) {
      this.completedEmitted = true
      this.bus.emit('station:completed', {})
    }
    return true
  }

  /** Восстановить проценты из сейва. */
  restore(percents: Record<string, number>): void {
    for (const [moduleId, percent] of Object.entries(percents)) {
      if (this.percents.has(moduleId)) {
        this.percents.set(moduleId, Math.min(1, Math.max(0, percent)))
      }
    }
    this.completedEmitted = this.totalPercent >= 1
    this.bus.emit('station:progress', { percent: this.totalPercent })
    for (const moduleId of this.percents.keys()) {
      this.bus.emit('station:moduleChanged', { moduleId, percent: this.getPercent(moduleId) })
    }
  }

  /** Слепок для сейва. */
  saveState(): Record<string, number> {
    return Object.fromEntries(this.percents)
  }
}
