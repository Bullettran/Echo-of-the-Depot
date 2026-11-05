import Phaser from 'phaser'

/**
 * Загрузка и генерация текстур-заглушек. Пока нет Kenney-паков (W1.2),
 * спрайты рисуются кодом в generateTexture — ассеты в репо не нужны.
 * Ключи текстур проекта: 'player', 'ground' (пополняется здесь же).
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot')
  }

  /** Генерирует плейсхолдеры и передаёт управление WorldScene. */
  create(): void {
    this.createPlayerTexture()
    this.createGroundTexture()
    this.scene.start('world')
  }

  /** Текстура 'player' 16×16: спецовка + каска + маркер направления взгляда. */
  private createPlayerTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    // спецовка инженера
    g.fillStyle(0x4e6b2f, 1)
    g.fillRect(2, 5, 12, 10)
    // каска
    g.fillStyle(0xd9a23a, 1)
    g.fillRect(4, 1, 8, 5)
    // маркер направления взгляда
    g.fillStyle(0x1c1f29, 1)
    g.fillRect(7, 4, 2, 2)
    g.generateTexture('player', 16, 16)
    g.destroy()
  }

  /** Текстура 'ground' 32×32 (тайл бетонной плиты) — тайлится TileSprite'ом. */
  private createGroundTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)
    // бетон пустоши
    g.fillStyle(0x2e3240, 1)
    g.fillRect(0, 0, 32, 32)
    // швы плит
    g.fillStyle(0x272b38, 1)
    g.fillRect(0, 0, 32, 1)
    g.fillRect(0, 0, 1, 32)
    // потёртости
    g.fillStyle(0x333849, 1)
    g.fillRect(8, 12, 6, 4)
    g.fillRect(20, 22, 5, 3)
    g.generateTexture('ground', 32, 32)
    g.destroy()
  }
}
