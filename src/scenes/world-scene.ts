import Phaser from 'phaser'
import { gameEvents } from '../core/event-bus'
import { Player } from '../entities/player'
import { TimeSystem } from '../systems/time-system'

const WORLD_WIDTH = 1600
const WORLD_HEIGHT = 1200
const WALL_THICKNESS = 32

export class WorldScene extends Phaser.Scene {
  private player!: Player
  private timeSystem!: TimeSystem
  private walls!: Phaser.Physics.Arcade.StaticGroup

  constructor() {
    super('world')
  }

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
  }

  update(_time: number, delta: number): void {
    // кламп от прыжка времени после сворачивания вкладки
    const dtMs = Math.min(delta, 50)
    this.timeSystem.update(dtMs)
  }

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
