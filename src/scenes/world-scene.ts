import Phaser from 'phaser'
import { ConditionsComponent } from '../components/conditions-component'
import { InventoryComponent } from '../components/inventory-component'
import { InteractComponent } from '../components/interact-component'
import { StatsComponent } from '../components/stats-component'
import { SaveSystem, type S_SaveData } from '../core/save-system'
import { gameEvents } from '../core/event-bus'
import {
  E_ConditionId,
  E_StatType,
  type S_EffectConfig,
  type S_ItemConfig,
  type S_StationConfig,
  type S_ResourceConfig,
  type S_StatsConfig,
} from '../data/types'
import { Player } from '../entities/player'
import { ResourceNode } from '../entities/resource-node'
import { CraftingSystem, type RecipesTable } from '../systems/crafting-system'
import { StationSystem } from '../systems/station-system'
import { TimeSystem } from '../systems/time-system'
import effectsJson from '../data/effects.json'
import inventoryJson from '../data/inventory.json'
import itemsJson from '../data/items.json'
import recipesJson from '../data/recipes.json'
import resourcesJson from '../data/resources.json'
import stationJson from '../data/station.modules.json'
import statsJson from '../data/stats.json'
import { StationModule } from '../entities/station-module'

const WORLD_WIDTH = 1600
const WORLD_HEIGHT = 1200
const WALL_THICKNESS = 32
const INTERACT_RADIUS = 96
const AUTOSAVE_INTERVAL_MS = 10_000

/** Ручная расстановка нод до Tiled-карты (W2): id конфига из resources.json + позиция. */
const NODE_LAYOUT: Array<{ configId: string; x: number; y: number }> = [
  { configId: 'scrap-heap', x: 420, y: 340 },
  { configId: 'scrap-heap', x: 1180, y: 820 },
  { configId: 'copper-node', x: 1240, y: 420 },
  { configId: 'copper-node', x: 520, y: 880 },
  { configId: 'supply-cache', x: 830, y: 380 },
  { configId: 'supply-cache', x: 360, y: 700 },
]

/** Расстановка модулей станции (реактор → ворота → вышка), W2.1. */
const MODULE_LAYOUT: Array<{ moduleId: string; x: number; y: number }> = [
  { moduleId: 'reactor', x: 620, y: 430 },
  { moduleId: 'gates', x: 900, y: 430 },
  { moduleId: 'tower', x: 1080, y: 330 },
]

/**
 * Мир главы: тайлмап-заглушка, сущности, порядок тиков систем и смерть/респаун.
 * Оркестратор — сам ничего не считает: время/нужды/условия живут в системах и компонентах.
 */
export class WorldScene extends Phaser.Scene {
  private player!: Player
  private timeSystem!: TimeSystem
  private stats!: StatsComponent
  private conditions!: ConditionsComponent
  private inventory!: InventoryComponent
  private interact!: InteractComponent
  private crafting!: CraftingSystem
  private station!: StationSystem
  private saveSystem!: SaveSystem
  private saveTimerMs = 0
  private nodes: ResourceNode[] = []
  private modules: StationModule[] = []
  private walls!: Phaser.Physics.Arcade.StaticGroup

  constructor() {
    super('world')
  }

  /** Построение мира. Порядок тиков в update(): время → условия → статы → ноды → промпт → игрок. */
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
    this.inventory = new InventoryComponent(
      gameEvents,
      inventoryJson,
      itemsJson as Record<string, S_ItemConfig>,
    )

    const resourceConfigs = resourcesJson as Record<string, S_ResourceConfig>
    for (const layout of NODE_LAYOUT) {
      const config = resourceConfigs[layout.configId]
      if (!config) throw new Error(`Unknown resource config: ${layout.configId}`)
      this.nodes.push(
        new ResourceNode(this, layout.x, layout.y, config, this.inventory, gameEvents),
      )
    }

    // станция: система владеет процентами, спрайты — только цели для E
    const stationConfig = stationJson as S_StationConfig
    this.station = new StationSystem(gameEvents, stationConfig, this.inventory)
    for (const layout of MODULE_LAYOUT) {
      const config = stationConfig.modules[layout.moduleId]
      if (!config) throw new Error(`Unknown station module: ${layout.moduleId}`)
      this.modules.push(new StationModule(this, layout.x, layout.y, config, this.station))
    }

    this.interact = new InteractComponent(
      gameEvents,
      () => [...this.nodes, ...this.modules],
      this.player,
      INTERACT_RADIUS,
    )
    this.interact.bindKey()

    // крафт: рецепты + рюкзак; команда из UI — 'ui:craft'
    this.crafting = new CraftingSystem(
      gameEvents,
      recipesJson as RecipesTable,
      this.inventory,
    )
    const offCraft = gameEvents.on('ui:craft', ({ recipeId }) => this.crafting.craft(recipeId))

    // сейв: загрузка при старте, автосейв каждые AUTOSAVE_INTERVAL_MS
    this.saveSystem = new SaveSystem(window.localStorage)
    this.loadGame()

    // команда из UI: употребить предмет (клик по слоту в инвентаре)
    const offUseItem = gameEvents.on('ui:use-item', ({ itemId }) => this.useItem(itemId))

    // смерть → респаун в центре депо (позже — у депо), статы восстанавливает сам StatsComponent
    const offDied = gameEvents.on('player:died', () => {
      this.player.setPosition(WORLD_WIDTH / 2, WORLD_HEIGHT / 2)
      this.stats.respawn()
    })
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      offCraft()
      offUseItem()
      offDied()
      this.interact.destroy()
    })

    // dev-only хук для смоук-тестов (playwright-cli)
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__eotd = {
        player: this.player,
        stats: this.stats,
        inventory: this.inventory,
        crafting: this.crafting,
        station: this.station,
        saveGame: () => this.saveGame(),
        clearSave: () => this.saveSystem.clear(),
        E_StatType,
      }
    }
  }

  /**
   * Игровой цикл сцены. dt клампится (сворачивание вкладки не должно телепортировать время),
   * TimeSystem возвращает игровые часы — их получают условия, нужды и ноды.
   */
  update(_time: number, delta: number): void {
    const dtMs = Math.min(delta, 50)
    const dtHours = this.timeSystem.update(dtMs)
    this.conditions.tick(dtHours)
    this.stats.tick(dtHours)
    for (const node of this.nodes) node.tick(dtHours)
    this.interact.update()
    // UpdateList Phaser вызывает у GameObjects только preUpdate —
    // update() игрока запускаем из сцены явно
    this.player.update()

    // автосейв: копим реальное время, периодически пишем слепок мира
    this.saveTimerMs += dtMs
    if (this.saveTimerMs >= AUTOSAVE_INTERVAL_MS) {
      this.saveTimerMs = 0
      this.saveGame()
    }
  }

  /** Слепок мира в localStorage (время, статы, рюкзак, состояние нод и станции). */
  private saveGame(): void {
    const nodes: S_SaveData['nodes'] = []
    this.nodes.forEach((node, index) => {
      const layout = NODE_LAYOUT[index]
      if (!layout) return
      nodes.push({ configId: layout.configId, ...node.saveState() })
    })
    const data: S_SaveData = {
      schemaVersion: 1,
      timeHours: this.timeSystem.totalHours,
      stats: this.stats.snapshot,
      inventory: this.inventory.slotsView,
      nodes,
      station: this.station.saveState(),
    }
    this.saveSystem.save(data)
  }

  /** Загрузка сейва при старте. Сопоставление нод — по индексу И configId. */
  private loadGame(): void {
    const data = this.saveSystem.load()
    if (!data) return
    this.timeSystem.setTime(data.timeHours)
    this.stats.restore(data.stats)
    this.inventory.restore(data.inventory)
    if (data.station) this.station.restore(data.station)
    data.nodes.forEach((nodeState, index) => {
      const node = this.nodes[index]
      const layout = NODE_LAYOUT[index]
      if (node && layout && layout.configId === nodeState.configId) {
        node.restore(nodeState)
      }
    })
  }

  /**
   * Употребить предмет из рюкзака (команда 'ui:use-item').
   * Валидация здесь: consumable с эффектами, предмет в наличии.
   */
  private useItem(itemId: string): void {
    const item = (itemsJson as Record<string, S_ItemConfig>)[itemId]
    if (!item?.use) return
    if (!this.inventory.remove(itemId, 1)) return
    if (item.use.hunger !== undefined) this.stats.add(E_StatType.Hunger, item.use.hunger)
    if (item.use.thirst !== undefined) this.stats.add(E_StatType.Thirst, item.use.thirst)
    if (item.use.hp !== undefined) this.stats.add(E_StatType.Hp, item.use.hp)
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
