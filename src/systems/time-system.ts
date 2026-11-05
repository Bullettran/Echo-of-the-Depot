import type { EventBus, GameEventMap } from '../core/event-bus'
import { E_TimePhase } from '../data/types'

export interface TimeSystemConfig {
  /** Реальных мс на один игровой день. По умолчанию 10 минут (WEB_PLAN §2). */
  dayLengthMs?: number
  /** Стартовое время суток в часах. По умолчанию 8:00. */
  startHour?: number
}

const DEFAULT_DAY_LENGTH_MS = 600_000
const DEFAULT_START_HOUR = 8

/**
 * Игровое время: дни, часы, фазы суток. Чистый TS, без Phaser — тикает
 * от dt из игрового цикла сцены и эмитит события по шине.
 * Все системы выживания получают игровые часы через возвращаемое значение update().
 */
export class TimeSystem {
  private elapsedHours: number
  private readonly dayLengthMs: number
  private readonly bus: EventBus<GameEventMap>
  private lastMinuteIndex: number
  private lastDay: number
  private lastPhase: E_TimePhase

  /** @param config — переопределение длины дня и стартового часа (для тестов и баланса). */
  constructor(bus: EventBus<GameEventMap>, config: TimeSystemConfig = {}) {
    this.bus = bus
    this.dayLengthMs = config.dayLengthMs ?? DEFAULT_DAY_LENGTH_MS
    this.elapsedHours = config.startHour ?? DEFAULT_START_HOUR
    this.lastMinuteIndex = Math.floor(this.elapsedHours * 60)
    this.lastDay = this.day
    this.lastPhase = this.computePhase()
  }

  /**
   * Продвинуть время на dtMs реальных миллисекунд.
   * Эмитит: 'time:minute' при смене игровой минуты, 'time:newDay' в полночь, 'time:phase' при смене фазы.
   * @returns прошедшие игровые часы — их скармливают Stats/Conditions (тик нужд).
   */
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

  /** Текущий день, начиная с 1. */
  get day(): number {
    return Math.floor(this.elapsedHours / 24) + 1
  }

  /** Час суток 0..23. */
  get hour(): number {
    return Math.floor(this.elapsedHours % 24)
  }

  /** Минута часа 0..59. */
  get minute(): number {
    return Math.floor((this.elapsedHours % 1) * 60)
  }

  /** Фаза суток: рассвет 5–7, день 7–18, закат 18–20, ночь 20–5 (LORE §5: ночью агрессивнее — W3). */
  get phase(): E_TimePhase {
    return this.computePhase()
  }

  /** Всего прошедших игровых часов — поле сейва. */
  get totalHours(): number {
    return this.elapsedHours
  }

  /** Восстановить время из сейва; счётчики событий пересчитываются без эмитов. */
  setTime(hours: number): void {
    this.elapsedHours = hours
    this.lastMinuteIndex = Math.floor(this.elapsedHours * 60)
    this.lastDay = this.day
    this.lastPhase = this.computePhase()
  }

  private computePhase(): E_TimePhase {
    const h = this.hour
    if (h >= 5 && h < 7) return E_TimePhase.Dawn
    if (h >= 7 && h < 18) return E_TimePhase.Day
    if (h >= 18 && h < 20) return E_TimePhase.Dusk
    return E_TimePhase.Night
  }
}
