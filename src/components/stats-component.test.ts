import { describe, expect, it, vi } from 'vitest'
import { EventBus, type GameEventMap } from '../core/event-bus'
import {
  E_ConditionId,
  E_StatType,
  type S_EffectConfig,
  type S_StatsConfig,
} from '../data/types'
import { ConditionsComponent } from './conditions-component'
import { StatsComponent } from './stats-component'

const STATS: S_StatsConfig = {
  start: { hp: 100, hunger: 80, thirst: 80 },
  max: { hp: 100, hunger: 100, thirst: 100 },
  decayPerHour: { hunger: 4, thirst: 5 },
}

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

function make(statsOverrides: Partial<S_StatsConfig> = {}) {
  const bus = new EventBus<GameEventMap>()
  const conditions = new ConditionsComponent(bus, EFFECTS)
  const stats = new StatsComponent(bus, { ...STATS, ...statsOverrides }, conditions)
  return { bus, conditions, stats }
}

describe('StatsComponent', () => {
  it('тик списывает голод/жажду по игровым часам и эмитит нормированный снапшот', () => {
    const { bus, stats } = make()
    const onStats = vi.fn()
    bus.on('stats:changed', onStats)

    stats.tick(1)

    expect(stats.snapshot.hunger).toBe(76)
    expect(stats.snapshot.thirst).toBe(75)
    expect(onStats).toHaveBeenCalledWith({ hp: 1, hunger: 0.76, thirst: 0.75 })
  })

  it('нужды не падают ниже нуля', () => {
    const { stats } = make()
    stats.tick(1000)
    expect(stats.snapshot.hunger).toBe(0)
    expect(stats.snapshot.thirst).toBe(0)
  })

  it('ноль нужды активирует дебафф, подъём — снимает', () => {
    const { conditions, stats } = make()

    stats.add(E_StatType.Hunger, -999)
    expect(conditions.isActive(E_ConditionId.Starving)).toBe(true)

    stats.add(E_StatType.Hunger, 10)
    expect(conditions.isActive(E_ConditionId.Starving)).toBe(false)
  })

  it('активные дебаффы дрят HP по сумме hpPerHour', () => {
    const { stats } = make()
    stats.add(E_StatType.Hunger, -999)
    stats.add(E_StatType.Thirst, -999)

    stats.tick(2)

    // голодание -4 + обезвоживание -6 = -10/час
    expect(stats.snapshot.hp).toBe(80)
  })

  it('HP 0 → player:died один раз, тик замер до респауна', () => {
    const { bus, stats } = make()
    const onDied = vi.fn()
    bus.on('player:died', onDied)

    stats.add(E_StatType.Hp, -100)
    stats.tick(1)
    stats.tick(5)

    expect(onDied).toHaveBeenCalledTimes(1)
    expect(stats.IsDeadState).toBe(true)
    expect(stats.snapshot.hp).toBe(0)
  })

  it('respawn: статы на 50%, активна «Перезагрузка носителя», смерть снята', () => {
    const { conditions, stats } = make()
    stats.add(E_StatType.Hp, -100)
    stats.tick(1)
    expect(stats.IsDeadState).toBe(true)

    stats.respawn()

    expect(stats.IsDeadState).toBe(false)
    expect(stats.snapshot.hp).toBe(50)
    expect(stats.snapshot.hunger).toBe(50)
    expect(stats.snapshot.thirst).toBe(50)
    expect(conditions.isActive(E_ConditionId.CarrierRestart)).toBe(true)
  })

  it('кап «Перезагрузки носителя» не даёт статам подняться выше 50%', () => {
    const { conditions, stats } = make()
    conditions.activate(E_ConditionId.CarrierRestart)

    stats.add(E_StatType.Hp, 999)
    stats.add(E_StatType.Hunger, 999)

    expect(stats.snapshot.hp).toBe(50)
    expect(stats.snapshot.hunger).toBe(50)
  })

  it('после истечения капа стат снова может подняться до максимума', () => {
    const { conditions, stats } = make()
    conditions.activate(E_ConditionId.CarrierRestart)
    stats.add(E_StatType.Hp, 999)
    expect(stats.snapshot.hp).toBe(50)

    conditions.tick(6)
    stats.add(E_StatType.Hp, 999)

    expect(stats.snapshot.hp).toBe(100)
  })
})
