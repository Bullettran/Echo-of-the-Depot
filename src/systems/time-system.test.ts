import { describe, expect, it, vi } from 'vitest'
import { EventBus, type GameEventMap } from '../core/event-bus'
import { E_TimePhase } from '../data/types'
import { TimeSystem } from './time-system'

// 1 игровая минута = 1000 реальных мс — удобно для тестов
const MS_PER_MINUTE = 1_440_000

function createTime(startHour?: number) {
  const bus = new EventBus<GameEventMap>()
  const system = new TimeSystem(bus, { dayLengthMs: MS_PER_MINUTE, startHour })
  return { bus, system }
}

describe('TimeSystem', () => {
  it('стартует с дефолтным временем 08:00 дня 1', () => {
    const { system } = createTime()
    expect(system.day).toBe(1)
    expect(system.hour).toBe(8)
    expect(system.minute).toBe(0)
  })

  it('тикает минуты и эмитит time:minute', () => {
    const { bus, system } = createTime()
    const onMinute = vi.fn()
    bus.on('time:minute', onMinute)

    system.update(1000)

    expect(system.minute).toBe(1)
    expect(onMinute).toHaveBeenCalledWith({ day: 1, hour: 8, minute: 1 })
  })

  it('не эмитит повторно, пока минута не сменилась', () => {
    const { bus, system } = createTime()
    const onMinute = vi.fn()
    bus.on('time:minute', onMinute)

    system.update(400)
    system.update(400)

    expect(onMinute).not.toHaveBeenCalled()
  })

  it('перелистывает день в полночь и эмитит time:newDay', () => {
    const { bus, system } = createTime(23 + 59 / 60)
    const onNewDay = vi.fn()
    bus.on('time:newDay', onNewDay)

    system.update(1000)

    expect(system.day).toBe(2)
    expect(system.hour).toBe(0)
    expect(system.minute).toBe(0)
    expect(onNewDay).toHaveBeenCalledWith({ day: 2 })
  })

  it('считает фазу суток по часам', () => {
    expect(createTime(6).system.phase).toBe(E_TimePhase.Dawn)
    expect(createTime(12).system.phase).toBe(E_TimePhase.Day)
    expect(createTime(19).system.phase).toBe(E_TimePhase.Dusk)
    expect(createTime(23).system.phase).toBe(E_TimePhase.Night)
    expect(createTime(3).system.phase).toBe(E_TimePhase.Night)
  })

  it('эмитит time:phase при смене фазы', () => {
    const { bus, system } = createTime(6 + 59 / 60)
    const onPhase = vi.fn()
    bus.on('time:phase', onPhase)

    system.update(1000)

    expect(system.phase).toBe(E_TimePhase.Day)
    expect(onPhase).toHaveBeenCalledWith({ phase: E_TimePhase.Day })
  })
})
