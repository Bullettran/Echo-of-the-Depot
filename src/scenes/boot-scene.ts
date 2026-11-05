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
    this.createNodeTextures()
    this.createModuleTextures()
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

  /** Текстуры ресурсных нод (ключи = texture в resources.json): scrap/copper/cache. */
  private createNodeTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // куча металлолома: серые пластины
    g.fillStyle(0x6b7280, 1)
    g.fillRect(0, 6, 24, 10)
    g.fillStyle(0x868e9c, 1)
    g.fillRect(4, 2, 14, 6)
    g.fillStyle(0x49505e, 1)
    g.fillRect(3, 9, 6, 3)
    g.fillRect(14, 10, 5, 3)
    g.generateTexture('node-scrap', 24, 16)

    // медная обмотка: оранжевый блок с прожилками
    g.fillStyle(0xb87333, 1)
    g.fillRect(0, 4, 18, 14)
    g.fillStyle(0xd98e4a, 1)
    g.fillRect(3, 2, 12, 5)
    g.fillStyle(0x8a5526, 1)
    g.fillRect(4, 9, 3, 6)
    g.fillRect(10, 7, 3, 8)
    g.generateTexture('node-copper', 18, 18)

    // схрон: ящик с крестовиной
    g.fillStyle(0x8b5a2b, 1)
    g.fillRect(0, 2, 22, 14)
    g.fillStyle(0x5e3d1d, 1)
    g.fillRect(2, 4, 18, 10)
    g.fillStyle(0xa97640, 1)
    g.fillRect(9, 2, 4, 14)
    g.fillRect(0, 7, 22, 4)
    g.generateTexture('node-cache', 22, 16)

    g.destroy()
  }

  /** Текстуры модулей станции (ключи = texture в station.modules.json). */
  private createModuleTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false)

    // реакторная: тёмный корпус с сердцевиной
    g.fillStyle(0x3a4050, 1)
    g.fillRect(0, 0, 24, 24)
    g.fillStyle(0x262b38, 1)
    g.fillRect(0, 0, 24, 4)
    g.fillRect(0, 20, 24, 4)
    g.fillStyle(0x7a4a4a, 1)
    g.fillRect(8, 8, 8, 8)
    g.generateTexture('module-reactor', 24, 24)

    // ворота депо: две створки с рельсами-направляющими
    g.fillStyle(0x4a4440, 1)
    g.fillRect(0, 0, 28, 16)
    g.fillStyle(0x2e2b28, 1)
    g.fillRect(0, 0, 28, 3)
    g.fillRect(0, 13, 28, 3)
    g.fillStyle(0x5e574f, 1)
    g.fillRect(3, 3, 9, 10)
    g.fillRect(16, 3, 9, 10)
    g.generateTexture('module-gates', 28, 16)

    // сигнальная вышка: мачта с перекладинами и лампой
    g.fillStyle(0x555f6e, 1)
    g.fillRect(6, 6, 4, 20)
    g.fillRect(2, 12, 12, 2)
    g.fillRect(3, 18, 10, 2)
    g.fillStyle(0x8a6a4a, 1)
    g.fillRect(3, 2, 10, 5)
    g.generateTexture('module-tower', 16, 26)

    g.destroy()
  }
}
