import { gameEvents } from '../core/event-bus'
import { Hud } from '../ui/hud/hud'

/**
 * Мост «мир → DOM» (правило №3): ЕДИНСТВЕННОЕ место, где подписки UI
 * подключаются к шине. UI-код не знает про Phaser, мир не знает про DOM.
 * Новые элементы HUD подключаются новой подпиской здесь.
 */
export function mountWorldToDomBridge(): void {
  const root = document.getElementById('ui')
  if (!root) throw new Error('#ui root element not found')

  const hud = new Hud(root)
  gameEvents.on('time:minute', ({ day, hour, minute }) => {
    hud.setClock(day, hour, minute)
  })
  gameEvents.on('stats:changed', (stats) => {
    hud.setStats(stats)
  })
  gameEvents.on('conditions:changed', ({ active }) => {
    hud.setConditions(active)
  })
  gameEvents.on('player:died', () => {
    hud.showStatus('Носитель перезагружен. Системы восстановлены на 50%.')
  })
}
