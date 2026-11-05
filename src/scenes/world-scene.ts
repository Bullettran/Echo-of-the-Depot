import Phaser from 'phaser'
import { ConditionsComponent } from '../components/conditions-component'
import { StatsComponent } from '../components/stats-component'
import { gameEvents } from '../core/event-bus'
import { E_ConditionId, E_StatType, type S_EffectConfig, type S_StatsConfig } from '../data/types'
import { Player } from '../entities/player'
import { TimeSystem } from '../systems/time-system'
import effectsJson from '../data/effects.json'
import statsJson from '../data/stats.json'

const WORLD_WIDTH = 1600
const WORLD_HEIGHT = 1200
const WALL_THICKNESS = 32

/**
 * Мир главы: тайлмап-заглушка, сущности, порядок тиков систем и смерть/респаун.
 * Оркестратор — сам ничего не считает: время/нужды/условия живут в системах и компонентах.
 */
export class WorldScene extends Phaser.Scene {
  private player!: Player
  private timeSystem!: TimeSystem
  private stats!: StatsComponent
  private conditions!: ConditionsComponent
  private walls!: Phaser.Physics.Arcade.StaticGroup

  constructor() {
    super('world')
  }

  /** Построение мира. Порядок тиков в update(): время → условия → статы → игрок. */
  create(): void {
    this.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 'ground').setOrigin(0)
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    this.createWalls()

    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2)
    this.physics.add.collider(this.player, this.walls)

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setZoom(2)
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    this.timeSystem = new TimeSystem(gameEvents)
    this.conditions = new ConditionsComponent(
      gameEvents,
      effectsJson as Record<E_ConditionId, S_EffectConfig>,
    )
    this.stats = new StatsComponent(gameEvents, statsJson as S_StatsConfig, this.conditions)

    // смерть → респаун в центре депо (позже — у депо), статы восстанавливает сам StatsComponent
    const offDied = gameEvents.on('player:died', () => {
      this.player.setPosition(WORLD_WIDTH / 2, WORLD_HEIGHT / 2)
      this.stats.respawn()
    })
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, offDied)

    // dev-only хук для смоук-тестов (playwright-cli)
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__eotd = {
        player: this.player,
        stats: this.stats,
        E_StatType,
      }
    }
  }

  /**
   * Игровой цикл сцены. dt клампится (сворачивание вкладки не должно телепортировать время),
   * TimeSystem возвращает игровые часы — их получают условия и нужды.
   */
  update(_time: number, delta: number): void {
    const dtMs = Math.min(delta, 50)
    const dtHours = this.timeSystem.update(dtMs)
    this.conditions.tick(dtHours)
    this.stats.tick(dtHours)
    // UpdateList Phaser вызывает у GameObjects только preUpdate —
    // update() игрока запускаем из сцены явно
    this.player.update()
  }

  /** Рамка мира из статических прямоугольников (пока нет тайлмап-коллизий из Tiled, W1.2+). */
  private createWalls(): void {
    this.walls = this.physics.add.staticGroup()
    const addWall = (x: number, y: number, w: number, h: number): void => {
      const rect = this.add.rectangle(x, y, w, h, 0x1c1f29)
      this.physics.add.existing(rect, true)
      this.walls.add(rect)
    }
    addWall(WORLD_WIDTH / 2, WALL_THICKNESS / 2, WORLD_WIDTH, WALL_THICKNESS)
    addWall(WORLD_WIDTH / 2, WORLD_HEIGHT - WALL_THICKNESS / 2, WORLD_WIDTH, WALL_THICKNESS)
    addWall(WALL_THICKNESS / 2, WORLD_HEIGHT / 2, WALL_THICKNESS, WORLD_HEIGHT)
    addWall(WORLD_WIDTH - WALL_THICKNESS / 2, WORLD_HEIGHT / 2, WALL_THICKNESS, WORLD_HEIGHT)
  }
}
