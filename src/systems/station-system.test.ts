import { describe, expect, it, vi } from 'vitest'
import { EventBus, type GameEventMap } from '../core/event-bus'
import type { S_ItemConfig, S_StationConfig } from '../data/types'
import { InventoryComponent } from '../components/inventory-component'
import { StationSystem } from './station-system'

const ITEMS: Record<string, S_ItemConfig> = {
  'repair-kit': { id: 'repair-kit', name: 'Ремкомплект', type: 'component', stack: 5 },
}

const CONFIG: S_StationConfig = {
  weights: { reactor: 0.4, gates: 0.3, tower: 0.3 },
  modules: {
    reactor: {
      id: 'reactor',
      name: 'Реакторная',
      action: 'Починить',
      texture: 'module-reactor',
      repair: { itemId: 'repair-kit', percentPerUnit: 50 },
    },
    gates: {
      id: 'gates',
      name: 'Ворота депо',
      action: 'Починить',
      texture: 'module-gates',
      repair: { itemId: 'repair-kit', percentPerUnit: 50 },
    },
    tower: {
      id: 'tower',
      name: 'Сигнальная вышка',
      action: 'Починить',
      texture: 'module-tower',
      repair: { itemId: 'repair-kit', percentPerUnit: 50 },
    },
  },
}

function make() {
  const bus = new EventBus<GameEventMap>()
  const inventory = new InventoryComponent(bus, { capacity: 12 }, ITEMS)
  const station = new StationSystem(bus, CONFIG, inventory)
  return { bus, inventory, station }
}

describe('StationSystem', () => {
  it('стартует с нулевыми модулями и нулевым прогрессом', () => {
    const { station } = make()
    expect(station.getPercent('reactor')).toBe(0)
    expect(station.totalPercent).toBe(0)
  })

  it('ремонт без ремкомплекта — отказ + station:repairFailed, ничего не меняется', () => {
    const { bus, station } = make()
    const onFailed = vi.fn()
    bus.on('station:repairFailed', onFailed)

    expect(station.repair('reactor')).toBe(false)
    expect(station.getPercent('reactor')).toBe(0)
    expect(onFailed).toHaveBeenCalledWith({ itemId: 'repair-kit', count: 1 })
  })

  it('ремонт списывает комплект и растит процент на percentPerUnit', () => {
    const { inventory, station } = make()
    inventory.add('repair-kit', 1)

    expect(station.repair('reactor')).toBe(true)
    expect(inventory.count('repair-kit')).toBe(0)
    expect(station.getPercent('reactor')).toBe(0.5)
    expect(station.totalPercent).toBeCloseTo(0.2) // 0.4 × 0.5
  })

  it('процент модуля не превышает 100% (лишние проценты срезаются)', () => {
    const { inventory, station } = make()
    inventory.add('repair-kit', 5)

    station.repair('reactor')
    station.repair('reactor') // 50 + 50 = 100
    station.repair('reactor') // уже готов — false

    expect(station.getPercent('reactor')).toBe(1)
    expect(station.repair('reactor')).toBe(false)
  })

  it('station:completed эмитится один раз при 100% всех модулей', () => {
    const { bus, inventory, station } = make()
    const onCompleted = vi.fn()
    bus.on('station:completed', onCompleted)
    inventory.add('repair-kit', 6)

    for (const id of ['reactor', 'gates', 'tower']) {
      station.repair(id)
      station.repair(id)
    }

    expect(station.totalPercent).toBe(1)
    expect(onCompleted).toHaveBeenCalledTimes(1)
  })

  it('restore/saveState: круг без потерь; восстановленный финал не эмитит completed заново', () => {
    const { bus, inventory, station } = make()
    const onCompleted = vi.fn()
    bus.on('station:completed', onCompleted)

    inventory.add('repair-kit', 6)
    for (const id of ['reactor', 'gates', 'tower']) {
      station.repair(id)
      station.repair(id)
    }
    const saved = station.saveState()

    const bus2 = new EventBus<GameEventMap>()
    const inventory2 = new InventoryComponent(bus2, { capacity: 12 }, ITEMS)
    const station2 = new StationSystem(bus2, CONFIG, inventory2)
    station2.restore(saved)

    expect(station2.totalPercent).toBe(1)
    expect(onCompleted).toHaveBeenCalledTimes(1) // только от первой станции
  })
})
