import { describe, expect, it, vi } from 'vitest'
import { EventBus, type GameEventMap } from '../core/event-bus'
import { E_ConditionId, type S_EffectConfig } from '../data/types'
import { ConditionsComponent } from './conditions-component'

const EFFECTS = {
  starving: { id: E_ConditionId.Starving, name: 'Голодание', hpPerHour: -4 },
  dehydrated: { id: E_ConditionId.Dehydrated, name: 'Обезвоживание', hpPerHour: -6 },
  'carrier-restart': {
    id: E_ConditionId.CarrierRestart,
    name: 'Перезагрузка носителя',
    durationHours: 6,
    statCapPercent: 50,
  },
} as Record<E_ConditionId, S_EffectConfig>

function make() {
  const bus = new EventBus<GameEventMap>()
  const conditions = new ConditionsComponent(bus, EFFECTS)
  return { bus, conditions }
}

describe('ConditionsComponent', () => {
  it('activate/deactivate эмитят conditions:changed со списком', () => {
    const { bus, conditions } = make()
    const onChanged = vi.fn()
    bus.on('conditions:changed', onChanged)

    conditions.activate(E_ConditionId.Starving)
    expect(onChanged).toHaveBeenCalledTimes(1)
    expect(conditions.isActive(E_ConditionId.Starving)).toBe(true)

    conditions.deactivate(E_ConditionId.Starving)
    expect(conditions.isActive(E_ConditionId.Starving)).toBe(false)
    expect(onChanged).toHaveBeenCalledTimes(2)
  })

  it('повторная активация не дублирует и не эмитит', () => {
    const { bus, conditions } = make()
    const onChanged = vi.fn()
    bus.on('conditions:changed', onChanged)

    conditions.activate(E_ConditionId.Starving)
    conditions.activate(E_ConditionId.Starving)

    expect(onChanged).toHaveBeenCalledTimes(1)
  })

  it('tick списывает durationHours и истекает', () => {
    const { conditions } = make()
    conditions.activate(E_ConditionId.CarrierRestart)

    conditions.tick(5)
    expect(conditions.isActive(E_ConditionId.CarrierRestart)).toBe(true)

    conditions.tick(1)
    expect(conditions.isActive(E_ConditionId.CarrierRestart)).toBe(false)
  })

  it('условия без durationHours не истекают', () => {
    const { conditions } = make()
    conditions.activate(E_ConditionId.Starving)
    conditions.tick(100)
    expect(conditions.isActive(E_ConditionId.Starving)).toBe(true)
  })

  it('cap — минимум среди активных, drain — сумма', () => {
    const { conditions } = make()
    expect(conditions.getStatCapPercent()).toBe(100)
    expect(conditions.getHpDrainPerHour()).toBe(0)

    conditions.activate(E_ConditionId.Starving)
    expect(conditions.getStatCapPercent()).toBe(100)
    expect(conditions.getHpDrainPerHour()).toBe(-4)

    conditions.activate(E_ConditionId.CarrierRestart)
    expect(conditions.getStatCapPercent()).toBe(50)
    expect(conditions.getHpDrainPerHour()).toBe(-4)

    conditions.activate(E_ConditionId.Dehydrated)
    expect(conditions.getHpDrainPerHour()).toBe(-10)
  })
})
