import Phaser from 'phaser'
import type { StationSystem } from '../systems/station-system'
import type { S_ModuleConfig } from '../data/types'
import type { I_Interactable } from './interactable'

/**
 * Модуль станции (реактор, ворота, вышка). Статичный спрайт-«трогаемая» цель:
 * вся логика ремонта — в StationSystem, сущность только представляет её в мире.
 * При 100% перекрашивается в «живой» цвет.
 */
export class StationModule extends Phaser.GameObjects.Sprite implements I_Interactable {
  private readonly config: S_ModuleConfig
  private readonly station: StationSystem

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: S_ModuleConfig,
    station: StationSystem,
  ) {
    super(scene, x, y, config.texture)
    this.config = config
    this.station = station
    scene.add.existing(this)
    this.setDepth(y)
    this.updateTint()
  }

  /** Подпись промпта с текущим процентом: «Починить: Реакторная (50%)». */
  getLabel(): string {
    const percent = Math.round(this.station.getPercent(this.config.id) * 100)
    return `${this.config.action}: ${this.config.name} (${percent}%)`
  }

  /** Готовый модуль трогать нечего. */
  IsAvailable(): boolean {
    return this.station.getPercent(this.config.id) < 1
  }

  getInteractCenter(): { x: number; y: number } {
    return { x: this.x, y: this.y }
  }

  /** Передать попытку ремонта в систему станции. */
  interact(): void {
    this.station.repair(this.config.id)
    this.updateTint()
  }

  /** «Живой» модуль — янтарно-зелёный подсвет; мёртвый — тускло-красноватый. */
  private updateTint(): void {
    const percent = this.station.getPercent(this.config.id)
    this.setTint(percent >= 1 ? 0xbfe07a : percent > 0 ? 0xd9c08a : 0x9a6a6a)
  }
}
