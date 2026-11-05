import { gameEvents } from '../core/event-bus'
import type { S_ItemConfig } from '../data/types'
import { Hud } from '../ui/hud/hud'
import { InventoryPanel } from '../ui/inventory/inventory-panel'
import { Toasts } from '../ui/toasts/toasts'
import inventoryJson from '../data/inventory.json'
import itemsJson from '../data/items.json'

/**
 * Мост «мир → DOM» (правило №3): ЕДИНСТВЕННОЕ место, где подписки UI
 * подключаются к шине. UI-код не знает про Phaser, мир не знает про DOM.
 * Команды игрока (Tab, клики) идут отсюда обратно в шину как 'ui:*'.
 */
export function mountWorldToDomBridge(): void {
  const root = document.getElementById('ui')
  if (!root) throw new Error('#ui root element not found')

  const items = itemsJson as Record<string, S_ItemConfig>
  const hud = new Hud(root)
  const toasts = new Toasts(root)
  const inventoryPanel = new InventoryPanel(
    root,
    items,
    inventoryJson.capacity,
    (itemId) => gameEvents.emit('ui:use-item', { itemId }),
  )

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
  gameEvents.on('interact:prompt', ({ label }) => {
    hud.setPrompt(label)
  })
  gameEvents.on('loot:collected', ({ itemId, count }) => {
    const name = items[itemId]?.name ?? itemId
    toasts.show(`+${count} ${name}`)
  })
  gameEvents.on('inventory:full', () => {
    toasts.show('Рюкзак полон')
  })
  gameEvents.on('inventory:changed', ({ slots }) => {
    inventoryPanel.render(slots)
  })

  // Tab — рюкзак: UI-комбинация, ловится в мосту (мир про неё не знает)
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Tab') {
      event.preventDefault()
      inventoryPanel.toggle()
    }
  })
}
