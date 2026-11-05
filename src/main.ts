import './styles.css'
import Phaser from 'phaser'
import { mountWorldToDomBridge } from './bridge/world-to-dom'
import { BootScene } from './scenes/boot-scene'
import { WorldScene } from './scenes/world-scene'

/**
 * Точка входа: конфиг Phaser (пиксель-арт, FIT-масштаб, arcade-физика),
 * список сцен и монтирование DOM-моста. Игровой логики здесь нет.
 */
new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#12141c',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [BootScene, WorldScene],
})

// мост монтируется сразу после старта: сцены эмитят позже (RAF), подписки уже на месте
mountWorldToDomBridge()
