import Phaser from 'phaser'

const PLAYER_SPEED = 220

// Физические коды клавиш (event.code) — работают на любой раскладке,
// в отличие от event.keyCode, который на русской раскладке отдаёт код «Ц» для W и т.д.
const CODE_W = 'KeyW'
const CODE_A = 'KeyA'
const CODE_S = 'KeyS'
const CODE_D = 'KeyD'

export class Player extends Phaser.GameObjects.Sprite {
  private readonly pressedCodes = new Set<string>()
  private readonly cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    this.pressedCodes.add(event.code)
  }

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.pressedCodes.delete(event.code)
  }

  private readonly onBlur = (): void => {
    // окно потеряло фокус при зажатой клавише — иначе «залипание» движения
    this.pressedCodes.clear()
  }

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
    keyboard.addCapture('W,A,S,D,UP,DOWN,LEFT,RIGHT')

    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('blur', this.onBlur)
  }

  override update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body

    let vx = 0
    let vy = 0
    if (this.pressedCodes.has(CODE_A) || this.cursorKeys.left.isDown) vx -= 1
    if (this.pressedCodes.has(CODE_D) || this.cursorKeys.right.isDown) vx += 1
    if (this.pressedCodes.has(CODE_W) || this.cursorKeys.up.isDown) vy -= 1
    if (this.pressedCodes.has(CODE_S) || this.cursorKeys.down.isDown) vy += 1

    if (vx !== 0 && vy !== 0) {
      vx /= Math.SQRT2
      vy /= Math.SQRT2
    }
    body.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED)

    if (vx !== 0) this.setFlipX(vx < 0)
    this.setDepth(this.y)
  }

  override destroy(fromScene?: boolean): this {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('blur', this.onBlur)
    super.destroy(fromScene)
    return this
  }
}
