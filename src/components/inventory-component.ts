import type { EventBus, GameEventMap } from '../core/event-bus'
import type { S_ItemConfig, S_InvSlot } from '../data/types'

export interface S_InventoryConfig {
  /** Число слотов рюкзака. */
  capacity: number
}

interface FitEntry {
  itemId: string
  count: number
}

/**
 * Рюкзак инженера. Чистый TS, без Phaser.
 * Фиксированное число слотов; один слот вмещает один предмет до его stack.
 * add/remove эмитят 'inventory:changed' со снапшотом занятых слотов.
 */
export class InventoryComponent {
  private readonly bus: EventBus<GameEventMap>
  private readonly items: Record<string, S_ItemConfig>
  private readonly slots: Array<S_InvSlot | null>

  /** @param items — таблица предметов из data/items.json (для stack и валидации id). */
  constructor(
    bus: EventBus<GameEventMap>,
    config: S_InventoryConfig,
    items: Record<string, S_ItemConfig>,
  ) {
    this.bus = bus
    this.items = items
    this.slots = Array.from({ length: config.capacity }, () => null)
  }

  /**
   * Положить предмет(ы): докладывает в существующие стаки, затем занимает пустые слоты.
   * @returns сколько реально поместилось (при нехватке места — меньше запрошенного).
   */
  add(itemId: string, count: number): number {
    const item = this.requireItem(itemId)
    let remaining = count

    for (const slot of this.slots) {
      if (remaining <= 0) break
      if (slot && slot.itemId === itemId && slot.count < item.stack) {
        const fits = item.stack - slot.count
        const take = Math.min(fits, remaining)
        slot.count += take
        remaining -= take
      }
    }
    for (let i = 0; i < this.slots.length && remaining > 0; i++) {
      if (this.slots[i] === null) {
        const take = Math.min(item.stack, remaining)
        this.slots[i] = { itemId, count: take }
        remaining -= take
      }
    }

    const added = count - remaining
    if (added > 0) this.emitChanged()
    return added
  }

  /**
   * Забрать предмет(ы). Атомарно: если суммарно меньше запрошенного —
   * ничего не трогает и возвращает false.
   */
  remove(itemId: string, count: number): boolean {
    if (this.count(itemId) < count) return false

    let remaining = count
    for (let i = this.slots.length - 1; i >= 0 && remaining > 0; i--) {
      const slot = this.slots[i]
      if (!slot || slot.itemId !== itemId) continue
      const take = Math.min(slot.count, remaining)
      slot.count -= take
      remaining -= take
      if (slot.count <= 0) this.slots[i] = null
    }

    this.emitChanged()
    return true
  }

  /** Сколько единиц предмета лежит в рюкзаке. */
  count(itemId: string): number {
    return this.slots.reduce(
      (sum, slot) => (slot && slot.itemId === itemId ? sum + slot.count : sum),
      0,
    )
  }

  /**
   * Поместится ли весь набор ПОСЛЕ удаления другого набора (сухой прогон).
   * Нужен крафту: результат должен влезть с учётом освободившихся слотов затрат.
   */
  canFitAfterRemoving(
    removals: FitEntry[],
    additions: FitEntry[],
  ): boolean {
    const simulation = this.slots.map((slot) => (slot ? { ...slot } : null))
    this.applyRemovals(simulation, removals)
    return this.fits(simulation, additions)
  }

  /**
   * Поместится ли весь набор (сухой прогон, ничего не меняет).
   * Нужен нодам: истощать ресурс только если дроп влезает целиком.
   */
  canFit(entries: FitEntry[]): boolean {
    return this.fits(this.slots.map((slot) => (slot ? { ...slot } : null)), entries)
  }

  /** Занятые слоты (снапшот для UI и событий). */
  get slotsView(): S_InvSlot[] {
    return this.slots.filter((slot): slot is S_InvSlot => slot !== null)
  }

  /** Восстановить состояние из сейва: слоты заполняются подряд, как сохранены. */
  restore(slots: S_InvSlot[]): void {
    this.slots.fill(null)
    for (let i = 0; i < slots.length && i < this.slots.length; i++) {
      const slot = slots[i]
      if (!slot) break
      this.slots[i] = { ...slot }
    }
    this.emitChanged()
  }

  private requireItem(itemId: string): S_ItemConfig {
    const item = this.items[itemId]
    if (!item) throw new Error(`Unknown item: ${itemId}`)
    return item
  }

  /** Удалить наборы из КОПИИ слотов (сухой шаг симуляции). */
  private applyRemovals(simulation: Array<S_InvSlot | null>, removals: FitEntry[]): void {
    for (const entry of removals) {
      let remaining = entry.count
      for (let i = simulation.length - 1; i >= 0 && remaining > 0; i--) {
        const slot = simulation[i]
        if (!slot || slot.itemId !== entry.itemId) continue
        const take = Math.min(slot.count, remaining)
        slot.count -= take
        remaining -= take
        if (slot.count <= 0) simulation[i] = null
      }
    }
  }

  /** Влезают ли additions в переданное состояние слотов. */
  private fits(simulation: Array<S_InvSlot | null>, additions: FitEntry[]): boolean {
    const demand = new Map<string, number>()
    for (const entry of additions) {
      demand.set(entry.itemId, (demand.get(entry.itemId) ?? 0) + entry.count)
    }
    for (const [itemId, count] of demand) {
      const stack = this.requireItem(itemId).stack
      let remaining = count
      for (const slot of simulation) {
        if (remaining <= 0) break
        if (slot && slot.itemId === itemId && slot.count < stack) {
          const take = Math.min(stack - slot.count, remaining)
          slot.count += take
          remaining -= take
        }
      }
      for (let i = 0; i < simulation.length && remaining > 0; i++) {
        if (simulation[i] === null) {
          const take = Math.min(stack, remaining)
          simulation[i] = { itemId, count: take }
          remaining -= take
        }
      }
      if (remaining > 0) return false
    }
    return true
  }

  private emitChanged(): void {
    this.bus.emit('inventory:changed', { slots: this.slotsView })
  }
}
