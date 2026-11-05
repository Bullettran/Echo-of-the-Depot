import { describe, expect, it, vi } from 'vitest'
import { EventBus, type GameEventMap } from '../core/event-bus'
import type { S_ItemConfig } from '../data/types'
import { InventoryComponent } from './inventory-component'

const ITEMS: Record<string, S_ItemConfig> = {
  scrap: { id: 'scrap', name: 'Металлолом', type: 'material', stack: 50 },
  ration: { id: 'ration', name: 'Консервы', type: 'consumable', stack: 2 },
  cloth: { id: 'cloth', name: 'Ткань', type: 'material', stack: 2 },
}

function make(capacity = 3) {
  const bus = new EventBus<GameEventMap>()
  const inventory = new InventoryComponent(bus, { capacity }, ITEMS)
  return { bus, inventory }
}

describe('InventoryComponent', () => {
  it('add докладывает в стак и эмитит inventory:changed', () => {
    const { bus, inventory } = make()
    const onChanged = vi.fn()
    bus.on('inventory:changed', onChanged)

    expect(inventory.add('scrap', 3)).toBe(3)
    expect(inventory.add('scrap', 2)).toBe(2)
    expect(inventory.count('scrap')).toBe(5)
    expect(inventory.slotsView).toEqual([{ itemId: 'scrap', count: 5 }])
    expect(onChanged).toHaveBeenCalledTimes(2)
  })

  it('переполнение стака занимает следующий слот', () => {
    const { inventory } = make(3)
    inventory.add('ration', 2) // стак = 2
    inventory.add('ration', 2)
    expect(inventory.slotsView).toEqual([
      { itemId: 'ration', count: 2 },
      { itemId: 'ration', count: 2 },
    ])
  })

  it('при нехватке места возвращает частичную добавку', () => {
    const { inventory } = make(2)
    const added = inventory.add('ration', 5) // 2 стака × 2 = максимум 4
    expect(added).toBe(4)
    expect(inventory.count('ration')).toBe(4)
  })

  it('canFit — сухой прогон без изменений', () => {
    const { inventory } = make(2)
    inventory.add('ration', 3) // занят 1 слот полностью + 1 частично

    expect(inventory.canFit([{ itemId: 'ration', count: 1 }])).toBe(true)
    expect(inventory.canFit([{ itemId: 'ration', count: 2 }])).toBe(false)
    expect(inventory.count('ration')).toBe(3)
  })

  it('canFit учитывает несколько позиций сразу', () => {
    const { inventory } = make(2)
    // ration×3 занимает 2 слота (стак 2), scrap×1 — третий: не влезает
    expect(inventory.canFit([{ itemId: 'ration', count: 3 }, { itemId: 'scrap', count: 1 }])).toBe(
      false,
    )
    // ровно 2 слота: влезает
    expect(inventory.canFit([{ itemId: 'ration', count: 2 }, { itemId: 'scrap', count: 50 }])).toBe(
      true,
    )
  })

  it('remove атомарно забирает через несколько слотов', () => {
    const { inventory } = make(3)
    inventory.add('ration', 4) // два полных стака

    expect(inventory.remove('ration', 3)).toBe(true)
    expect(inventory.count('ration')).toBe(1)
  })

  it('remove при нехватке ничего не меняет', () => {
    const { inventory } = make(3)
    inventory.add('scrap', 3)

    expect(inventory.remove('scrap', 5)).toBe(false)
    expect(inventory.count('scrap')).toBe(3)
    expect(inventory.remove('copper', 1)).toBe(false)
  })

  it('canFitAfterRemoving — место появляется после списания затрат', () => {
    const { inventory } = make(2)
    // слот 0: ткань×2 (стак 2), слот 1: металлолом×50 — рюкзак полон
    inventory.add('cloth', 2)
    inventory.add('scrap', 50)

    // без удаления металлолом×50 не влезает, с удалением ткани — влезает
    expect(inventory.canFit([{ itemId: 'scrap', count: 50 }])).toBe(false)
    expect(
      inventory.canFitAfterRemoving([{ itemId: 'cloth', count: 2 }], [
        { itemId: 'scrap', count: 50 },
      ]),
    ).toBe(true)
    // сухой прогон ничего не изменил
    expect(inventory.count('cloth')).toBe(2)
  })

  it('restore восстанавливает слоты из сейва', () => {
    const { inventory } = make(3)
    inventory.add('scrap', 5)

    inventory.restore([{ itemId: 'ration', count: 1 }, { itemId: 'scrap', count: 2 }])

    expect(inventory.slotsView).toEqual([
      { itemId: 'ration', count: 1 },
      { itemId: 'scrap', count: 2 },
    ])
  })

  it('неизвестный предмет бросает ошибку', () => {
    const { inventory } = make()
    expect(() => inventory.add('nuclear-warhead', 1)).toThrow('Unknown item')
  })
})
