import { describe, expect, it, vi } from 'vitest'
import { EventBus, type GameEventMap } from '../core/event-bus'
import type { S_ItemConfig, S_RecipeConfig } from '../data/types'
import { InventoryComponent } from '../components/inventory-component'
import { CraftingSystem } from './crafting-system'

const ITEMS: Record<string, S_ItemConfig> = {
  scrap: { id: 'scrap', name: 'Металлолом', type: 'material', stack: 50 },
  cloth: { id: 'cloth', name: 'Ткань', type: 'material', stack: 2 },
  bandage: { id: 'bandage', name: 'Бинт', type: 'consumable', stack: 10 },
}

const RECIPES: Record<string, S_RecipeConfig> = {
  bandage: {
    id: 'bandage',
    name: 'Бинт',
    cost: { cloth: 2 },
    result: { itemId: 'bandage', count: 1 },
  },
  // результат крупнее освободившегося места — для проверки отказа с полным рюкзаком
  'scrap-pile': {
    id: 'scrap-pile',
    name: 'Штабель лома',
    cost: { cloth: 2 },
    result: { itemId: 'scrap', count: 60 },
  },
}

function make(capacity = 2) {
  const bus = new EventBus<GameEventMap>()
  const inventory = new InventoryComponent(bus, { capacity }, ITEMS)
  const crafting = new CraftingSystem(bus, RECIPES, inventory)
  return { bus, inventory, crafting }
}

describe('CraftingSystem', () => {
  it('has/canCraft проверяют наличие рецепта и материалов', () => {
    const { inventory, crafting } = make()
    expect(crafting.has('bandage')).toBe(true)
    expect(crafting.has('rocket')).toBe(false)
    expect(crafting.canCraft('bandage')).toBe(false)

    inventory.add('cloth', 2)
    expect(crafting.canCraft('bandage')).toBe(true)
  })

  it('craft списывает затраты и кладёт результат, эмитит crafting:crafted', () => {
    const { bus, inventory, crafting } = make(3)
    const onCrafted = vi.fn()
    bus.on('crafting:crafted', onCrafted)
    inventory.add('cloth', 2)

    expect(crafting.craft('bandage')).toBe(true)
    expect(inventory.count('cloth')).toBe(0)
    expect(inventory.count('bandage')).toBe(1)
    expect(onCrafted).toHaveBeenCalledWith({
      recipeId: 'bandage',
      itemId: 'bandage',
      count: 1,
    })
  })

  it('craft при нехватке материалов — false, рюкзак не тронут', () => {
    const { inventory, crafting } = make(3)
    inventory.add('cloth', 1)

    expect(crafting.craft('bandage')).toBe(false)
    expect(inventory.count('cloth')).toBe(1)
    expect(inventory.count('bandage')).toBe(0)
  })

  it('craft, когда результат не влезает даже после списания — отказ, материалы не теряются', () => {
    const { bus, inventory, crafting } = make(2)
    const onFull = vi.fn()
    bus.on('inventory:full', onFull)
    // 2 слота: ткань×2 (стак 2) + металлолом×50 — рюкзак полон
    inventory.add('cloth', 2)
    inventory.add('scrap', 50)

    // scrap-pile даёт 60 лома: нужен 1 слот после списания ткани + он не влезает в остаток
    expect(crafting.craft('scrap-pile')).toBe(false)
    expect(onFull).toHaveBeenCalledTimes(1)
    // материал не потерян
    expect(inventory.count('cloth')).toBe(2)
  })

  it('craft учитывает освободившиеся слоты: результат влезает после списания', () => {
    const { inventory, crafting } = make(2)
    // ткань×2 занимает слот 0; слот 1 — металлоломом
    inventory.add('cloth', 2)
    inventory.add('scrap', 50)
    // после списания ткань освободит слот — бинт влезет именно туда
    expect(crafting.craft('bandage')).toBe(true)
    expect(inventory.count('bandage')).toBe(1)
  })
})
