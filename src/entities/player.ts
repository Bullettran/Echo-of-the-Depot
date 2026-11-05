import Phaser from 'phaser'

const PLAYER_SPEED = 220

interface MoveKeys {
  W: Phaser.Input.Keyboard.Key
  A: Phaser.Input.Keyboard.Key
  S: Phaser.Input.Keyboard.Key
  D: Phaser.Input.Keyboard.Key
}

export class Player extends Phaser.GameObjects.Sprite {
  private readonly cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys
  private readonly moveKeys: MoveKeys

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(12, 10)
    body.setOffset(2, 6)
    this.setDepth(y)

    const keyboard = scene.input.keyboard
    if (!keyboard) throw new Error('Keyboard plugin is not available')
    this.cursorKeys = keyboard.createCursorKeys()
    this.moveKeys = keyboard.addKeys('W,A,S,D') as MoveKeys
  }

  override update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body

    let vx = 0
    let vy = 0
    if (this.moveKeys.A.isDown || this.cursorKeys.left.isDown) vx -= 1
    if (this.moveKeys.D.isDown || this.cursorKeys.right.isDown) vx += 1
    if (this.moveKeys.W.isDown || this.cursorKeys.up.isDown) vy -= 1
    if (this.moveKeys.S.isDown || this.cursorKeys.down.isDown) vy += 1

    if (vx !== 0 && vy !== 0) {
      vx /= Math.SQRT2
      vy /= Math.SQRT2
    }
    body.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED)

    if (vx !== 0) this.setFlipX(vx < 0)
    this.setDepth(this.y)
  }
}
