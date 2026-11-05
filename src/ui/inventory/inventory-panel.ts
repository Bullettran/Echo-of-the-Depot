import type { S_ItemConfig, S_InvSlot, S_RecipeConfig } from '../../data/types'

/**
 * Панель рюкзака (DOM-оверлей, клавиша Tab): сетка слотов + секция крафта.
 * Клик по consumable отправляет команду употребления, клик по «Создать» — крафт;
 * обе команды уходят через колбэки моста в шину как 'ui:*'.
 * Drag-n-drop слотов отложен до W2 (нет сортировки/экипировки — см. BACKLOG).
 */
export class InventoryPanel {
  private readonly items: Record<string, S_ItemConfig>
  private readonly recipes: Record<string, S_RecipeConfig>
  private readonly capacity: number
  private readonly onUseItem: (itemId: string) => void
  private readonly onCraft: (recipeId: string) => void
  private readonly panelEl: HTMLElement
  private readonly gridEl: HTMLElement
  private readonly craftListEl: HTMLElement
  private IsOpen = false

  /**
   * @param items — таблица предметов (имена/типы для отрисовки и тултипов)
   * @param recipes — таблица рецептов для секции крафта
   * @param capacity — число слотов сетки (из data/inventory.json)
   * @param onUseItem / onCraft — мост передаёт команды (уходят в 'ui:*')
   */
  constructor(
    root: HTMLElement,
    items: Record<string, S_ItemConfig>,
    recipes: Record<string, S_RecipeConfig>,
    capacity: number,
    onUseItem: (itemId: string) => void,
    onCraft: (recipeId: string) => void,
  ) {
    this.items = items
    this.recipes = recipes
    this.capacity = capacity
    this.onUseItem = onUseItem
    this.onCraft = onCraft

    this.panelEl = document.createElement('div')
    this.panelEl.id = 'inv-panel'
    this.panelEl.classList.add('hidden')

    const titleEl = document.createElement('div')
    titleEl.id = 'inv-title'
    titleEl.textContent = 'Рюкзак [Tab]'

    this.gridEl = document.createElement('div')
    this.gridEl.id = 'inv-grid'

    const craftTitle = document.createElement('div')
    craftTitle.id = 'craft-title'
    craftTitle.textContent = 'Крафт (полевой — верстак будет в W5)'

    this.craftListEl = document.createElement('div')
    this.craftListEl.id = 'craft-list'

    this.panelEl.append(titleEl, this.gridEl, craftTitle, this.craftListEl)
    root.append(this.panelEl)
  }

  /** Открыть/закрыть панель. */
  toggle(): void {
    this.IsOpen = !this.IsOpen
    this.panelEl.classList.toggle('hidden', !this.IsOpen)
  }

  /**
   * Перерисовать панель по снапшоту занятых слотов ('inventory:changed'):
   * сетка рюкзака + строки рецептов с have/need и активностью кнопок.
   */
  render(slots: S_InvSlot[]): void {
    this.renderGrid(slots)
    this.renderCraft(slots)
  }

  private renderGrid(slots: S_InvSlot[]): void {
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

  /** Строки рецептов: cost have/need, кнопка активна если хватает материалов. */
  private renderCraft(slots: S_InvSlot[]): void {
    const have = new Map<string, number>()
    for (const slot of slots) have.set(slot.itemId, (have.get(slot.itemId) ?? 0) + slot.count)

    this.craftListEl.replaceChildren()
    for (const recipe of Object.values(this.recipes)) {
      const row = document.createElement('div')
      row.className = 'craft-row'

      const name = document.createElement('span')
      name.className = 'craft-name'
      name.textContent = recipe.name

      const cost = document.createElement('span')
      cost.className = 'craft-cost'
      const canCraft = Object.entries(recipe.cost).every(([itemId, need]) => {
        const item = this.items[itemId]
        const enough = (have.get(itemId) ?? 0) >= need
        cost.textContent += `${item?.name ?? itemId}: ${have.get(itemId) ?? 0}/${need}  `
        return enough
      })

      const button = document.createElement('button')
      button.className = 'craft-btn'
      button.dataset.recipeId = recipe.id
      button.textContent = 'Создать'
      button.disabled = !canCraft
      if (canCraft) {
        button.addEventListener('click', () => this.onCraft(recipe.id))
      }

      row.append(name, cost, button)
      this.craftListEl.append(row)
    }
  }
}
