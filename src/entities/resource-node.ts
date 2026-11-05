import Phaser from 'phaser'
import type { EventBus, GameEventMap } from '../core/event-bus'
import type { S_ResourceConfig } from '../data/types'
import { InventoryComponent } from '../components/inventory-component'
import type { I_Interactable } from './interactable'

type NodeState = 'ready' | 'depleted'

/**
 * Ресурсная нода мира: куча лома, медная обмотка, схрон.
 * interact() кладёт drops в рюкзак (только если влезает целиком), истощается
 * и оживает через respawnHours игровых часов (tick от сцены).
 */
export class ResourceNode extends Phaser.GameObjects.Sprite implements I_Interactable {
  private readonly bus: EventBus<GameEventMap>
  private readonly config: S_ResourceConfig
  private readonly inventory: InventoryComponent
  private nodeState: NodeState = 'ready'
  private respawnRemainingHours = 0

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: S_ResourceConfig,
    inventory: InventoryComponent,
    bus: EventBus<GameEventMap>,
  ) {
    super(scene, x, y, config.texture)
    this.bus = bus
    this.config = config
    this.inventory = inventory
    scene.add.existing(this)
    this.setDepth(y)
  }

  /** Подпись промпта: «Собрать: Куча металлолома». */
  getLabel(): string {
    return `${this.config.action}: ${this.config.name}`
  }

  IsAvailable(): boolean {
    return this.nodeState === 'ready'
  }

  getInteractCenter(): { x: number; y: number } {
    return { x: this.x, y: this.y }
  }

  /**
   * Собрать: если весь дроп влезает в рюкзак — добавить и истощить ноду,
   * иначе эмит 'inventory:full' (тост «Рюкзак полон»), нода не тратится.
   * Эмитит 'loot:collected' за каждую позицию дропа.
   */
  interact(): void {
    if (this.nodeState !== 'ready') return
    const firstDrop = this.config.drops[0]
    if (!this.inventory.canFit(this.config.drops)) {
      if (firstDrop) this.bus.emit('inventory:full', { itemId: firstDrop.itemId })
      return
    }
    for (const drop of this.config.drops) {
      this.inventory.add(drop.itemId, drop.count)
      this.bus.emit('loot:collected', { itemId: drop.itemId, count: drop.count })
    }
    this.nodeState = 'depleted'
    this.respawnRemainingHours = this.config.respawnHours
    this.setAlpha(0.25)
  }

  /** Тик от сцены: отсчёт до оживания (только в истощённом состоянии). */
  tick(dtHours: number): void {
    if (this.nodeState !== 'depleted') return
    this.respawnRemainingHours -= dtHours
    if (this.respawnRemainingHours <= 0) {
      this.nodeState = 'ready'
      this.setAlpha(1)
    }
  }
}
