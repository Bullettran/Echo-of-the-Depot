import type { S_ItemConfig, S_InvSlot } from '../../data/types'

/**
 * Панель рюкзака (DOM-оверлей, клавиша Tab). Сетка слотов из data,
 * клик по consumable отправляет команду употребления через колбэк моста.
 * Drag-n-drop слотов отложен до W2 (нет сортировки/экипировки — см. BACKLOG).
 */
export class InventoryPanel {
  private readonly items: Record<string, S_ItemConfig>
  private readonly capacity: number
  private readonly onUseItem: (itemId: string) => void
  private readonly panelEl: HTMLElement
  private readonly gridEl: HTMLElement
  private readonly titleEl: HTMLElement
  private IsOpen = false

  /**
   * @param items — таблица предметов (имена/типы для отрисовки и тултипов)
   * @param capacity — число слотов сетки (из data/inventory.json)
   * @param onUseItem — мост передаёт сюда клик по consumable (уходит в 'ui:use-item')
   */
  constructor(
    root: HTMLElement,
    items: Record<string, S_ItemConfig>,
    capacity: number,
    onUseItem: (itemId: string) => void,
  ) {
    this.items = items
    this.capacity = capacity
    this.onUseItem = onUseItem

    this.panelEl = document.createElement('div')
    this.panelEl.id = 'inv-panel'
    this.panelEl.classList.add('hidden')

    this.titleEl = document.createElement('div')
    this.titleEl.id = 'inv-title'
    this.titleEl.textContent = 'Рюкзак [Tab]'

    this.gridEl = document.createElement('div')
    this.gridEl.id = 'inv-grid'

    this.panelEl.append(this.titleEl, this.gridEl)
    root.append(this.panelEl)
  }

  /** Открыть/закрыть панель. */
  toggle(): void {
    this.IsOpen = !this.IsOpen
    this.panelEl.classList.toggle('hidden', !this.IsOpen)
  }

  /** Перерисовать сетку по снапшоту занятых слотов ('inventory:changed'). */
  render(slots: S_InvSlot[]): void {
    this.gridEl.replaceChildren()
    for (let i = 0; i < this.capacity; i++) {
      const slot = slots[i]
      const cell = document.createElement('div')
      cell.className = 'inv-slot'

      if (slot) {
        const item = this.items[slot.itemId]
        cell.classList.add('filled')
        const icon = document.createElement('div')
        icon.className = `inv-icon item-${slot.itemId}`
        const count = document.createElement('span')
        count.className = 'inv-count'
        count.textContent = String(slot.count)
        cell.append(icon, count)
        if (item) {
          const hint = item.use ? ' — ЛКМ: употребить' : ''
          cell.title = `${item.name} ×${slot.count}${hint}`
          if (item.use) {
            cell.addEventListener('click', () => this.onUseItem(slot.itemId))
          }
        }
      }
      this.gridEl.append(cell)
    }
  }
}
