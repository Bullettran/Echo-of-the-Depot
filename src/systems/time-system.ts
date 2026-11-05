import type { EventBus, GameEventMap } from '../core/event-bus'
import { E_TimePhase } from '../data/types'

export interface TimeSystemConfig {
  /** Реальных мс на один игровой день. По умолчанию 10 минут. */
  dayLengthMs?: number
  /** Стартовое время суток в часах. По умолчанию 8:00. */
  startHour?: number
}

const DEFAULT_DAY_LENGTH_MS = 600_000
const DEFAULT_START_HOUR = 8

export class TimeSystem {
  private elapsedHours: number
  private readonly dayLengthMs: number
  private readonly bus: EventBus<GameEventMap>
  private lastMinuteIndex: number
  private lastDay: number
  private lastPhase: E_TimePhase

  constructor(bus: EventBus<GameEventMap>, config: TimeSystemConfig = {}) {
    this.bus = bus
    this.dayLengthMs = config.dayLengthMs ?? DEFAULT_DAY_LENGTH_MS
    this.elapsedHours = config.startHour ?? DEFAULT_START_HOUR
    this.lastMinuteIndex = Math.floor(this.elapsedHours * 60)
    this.lastDay = this.day
    this.lastPhase = this.computePhase()
  }

  /** Продвигает время; возвращает прошедшие игровые часы — для тиков систем выживания. */
  update(dtMs: number): number {
    const hours = (dtMs / this.dayLengthMs) * 24
    this.elapsedHours += hours

    const minuteIndex = Math.floor(this.elapsedHours * 60)
    if (minuteIndex !== this.lastMinuteIndex) {
      this.lastMinuteIndex = minuteIndex
      this.bus.emit('time:minute', {
        day: this.day,
        hour: this.hour,
        minute: this.minute,
      })
    }

    const currentDay = this.day
    if (currentDay !== this.lastDay) {
      this.lastDay = currentDay
      this.bus.emit('time:newDay', { day: currentDay })
    }

    const phase = this.computePhase()
    if (phase !== this.lastPhase) {
      this.lastPhase = phase
      this.bus.emit('time:phase', { phase })
    }
    return hours
  }

  get day(): number {
    return Math.floor(this.elapsedHours / 24) + 1
  }

  get hour(): number {
    return Math.floor(this.elapsedHours % 24)
  }

  get minute(): number {
    return Math.floor((this.elapsedHours % 1) * 60)
  }

  get phase(): E_TimePhase {
    return this.computePhase()
  }

  private computePhase(): E_TimePhase {
    const h = this.hour
    if (h >= 5 && h < 7) return E_TimePhase.Dawn
    if (h >= 7 && h < 18) return E_TimePhase.Day
    if (h >= 18 && h < 20) return E_TimePhase.Dusk
    return E_TimePhase.Night
  }
}
