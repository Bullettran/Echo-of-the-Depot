import './styles.css'
import Phaser from 'phaser'
import { mountWorldToDomBridge } from './bridge/world-to-dom'
import { BootScene } from './scenes/boot-scene'
import { WorldScene } from './scenes/world-scene'

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

mountWorldToDomBridge()
