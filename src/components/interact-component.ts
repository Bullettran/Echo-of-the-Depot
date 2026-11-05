import type { EventBus, GameEventMap } from '../core/event-bus'
import type { I_Interactable } from '../entities/interactable'

/**
 * Поиск ближайшей доступной цели в радиусе от игрока и взаимодействие по E.
 * Аналог BPC_Interact из UE-плана. Чистая логика позиций, без Phaser-типов —
 * от сцены получает список целей и позицию игрока.
 */
export class InteractComponent {
  private readonly bus: EventBus<GameEventMap>
  private readonly getTargets: () => I_Interactable[]
  private readonly playerPos: { x: number; y: number }
  private readonly radius: number
  private current: I_Interactable | null = null

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    // !e.repeat — keydown авто-повтора не должен дёргать ноду каждый кадр задержки
    if (event.code === 'KeyE' && !event.repeat) this.interactCurrent()
  }

  /**
   * @param getTargets — провайдер целей (сцена отдаёт массив нод/объектов)
   * @param playerPos — позиция игрока (подходит Phaser-спрайт: у него есть x, y)
   * @param radius — радиус взаимодействия в мировых пикселях
   */
  constructor(
    bus: EventBus<GameEventMap>,
    getTargets: () => I_Interactable[],
    playerPos: { x: number; y: number },
    radius = 96,
  ) {
    this.bus = bus
    this.getTargets = getTargets
    this.playerPos = playerPos
    this.radius = radius
  }

  /** Подключить клавишу E (window-листенер, не Phaser — раскладко-независимо). */
  bindKey(): void {
    window.addEventListener('keydown', this.onKeyDown)
  }

  /** Снять листенер — на SHUTDOWN сцены. */
  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown)
  }

  /** Тик сцены: пересчитать ближайшую цель; промпт эмитится только при смене. */
  update(): void {
    let nearest: I_Interactable | null = null
    let nearestDist = this.radius * this.radius // сравнение квадратов — без sqrt
    for (const target of this.getTargets()) {
      if (!target.IsAvailable()) continue
      const center = target.getInteractCenter()
      const dx = center.x - this.playerPos.x
      const dy = center.y - this.playerPos.y
      const distSq = dx * dx + dy * dy
      if (distSq <= nearestDist) {
        nearest = target
        nearestDist = distSq
      }
    }

    if (nearest !== this.current) {
      this.current = nearest
      this.bus.emit('interact:prompt', { label: nearest ? nearest.getLabel() : null })
    }
  }

  /** Выполнить действие с текущей целью (если есть). */
  private interactCurrent(): void {
    this.current?.interact()
  }
}
