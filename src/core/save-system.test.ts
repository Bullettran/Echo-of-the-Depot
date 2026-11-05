import { describe, expect, it } from 'vitest'
import { SaveSystem, type S_SaveData } from './save-system'

/** In-memory двойник Storage для тестов (в node-окружении localStorage нет). */
function makeFakeStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
  }
}

const SAMPLE: S_SaveData = {
  schemaVersion: 1,
  timeHours: 30.5,
  stats: { hp: 50, hunger: 40, thirst: 30 },
  inventory: [{ itemId: 'bandage', count: 2 }],
  nodes: [{ configId: 'scrap-heap', IsDepleted: true, remainingHours: 1.5 }],
}

describe('SaveSystem', () => {
  it('save/load: полный круг без потерь', () => {
    const system = new SaveSystem(makeFakeStorage())
    system.save(SAMPLE)
    expect(system.load()).toEqual(SAMPLE)
  })

  it('load без сейва — null', () => {
    expect(new SaveSystem(makeFakeStorage()).load()).toBeNull()
  })

  it('load чужой версии схемы — null (место будущей миграции)', () => {
    const storage = makeFakeStorage()
    const system = new SaveSystem(storage)
    system.save({ ...SAMPLE, schemaVersion: 99 as unknown as 1 })
    expect(system.load()).toBeNull()
  })

  it('битый JSON не роняет игру — null', () => {
    const storage = makeFakeStorage()
    storage.setItem('eotd-save-v1', '{{{broken')
    expect(new SaveSystem(storage).load()).toBeNull()
  })

  it('clear стирает сейв', () => {
    const system = new SaveSystem(makeFakeStorage())
    system.save(SAMPLE)
    system.clear()
    expect(system.load()).toBeNull()
  })
})
