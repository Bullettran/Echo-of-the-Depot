import type { EventBus, GameEventMap } from '../core/event-bus'
import {
  E_ConditionId,
  E_StatType,
  type S_StatsConfig,
  type S_StatsSnapshot,
} from '../data/types'
import { ConditionsComponent } from './conditions-component'

type StatKey = keyof S_StatsSnapshot

const EMIT_PRECISION = 10

/**
 * Нужды и здоровье инженера. Чистый TS, без Phaser.
 * Голод/жажда тикают от игровых часов, на нуле включают дебаффы через
 * ConditionsComponent, активные дебаффы дрят HP. HP 0 → 'player:died',
 * после чего сцена вызывает respawn() (статы 50% + «Перезагрузка носителя»).
 */
export class StatsComponent {
  private readonly bus: EventBus<GameEventMap>
  private readonly config: S_StatsConfig
  private readonly conditions: ConditionsComponent
  private current: S_StatsSnapshot
  private lastEmitted: S_StatsSnapshot
  private IsDead = false

  /** @param config — таблица статов из data/stats.json; @param conditions — общие условия. */
  constructor(
    bus: EventBus<GameEventMap>,
    config: S_StatsConfig,
    conditions: ConditionsComponent,
  ) {
    this.bus = bus
    this.config = config
    this.conditions = conditions
    this.current = { ...config.start }
    this.lastEmitted = { ...config.start }
    this.emitSnapshot()
  }

  /**
   * Продвинуть нужды на dtHours игровых часов.
   * Эмитит 'stats:changed' при изменении; при hp<=0 — 'player:died' (один раз).
   * В мёртвом состоянии ничего не делает до respawn().
   */
  tick(dtHours: number): void {
    if (this.IsDead || dtHours <= 0) return

    this.current.hunger = Math.max(0, this.current.hunger - this.config.decayPerHour.hunger * dtHours)
    this.current.thirst = Math.max(0, this.current.thirst - this.config.decayPerHour.thirst * dtHours)
    this.syncConditions()

    const drain = this.conditions.getHpDrainPerHour()
    if (drain !== 0) this.setHp(this.current.hp + drain * dtHours)

    this.emitIfChanged()

    if (this.current.hp <= 0) this.die()
  }

  /**
   * Изменить стат (еда, вода, урон от врагов/среды). Пороговые дебаффы
   * пересчитываются сразу; урон в 0 убивает немедленно, не дожидаясь тика.
   */
  add(type: E_StatType, amount: number): void {
    if (this.IsDead) return
    const key = type as StatKey
    this.current[key] = clamp(this.current[key] + amount, 0, this.effectiveMax(type))
    if (type !== E_StatType.Hp) this.syncConditions()
    this.emitIfChanged()
    if (this.current.hp <= 0) this.die()
  }

  /**
   * Воскрешение: статы на 50% от максимума, активируется «Перезагрузка носителя»
   * (потолок 50% на 6 игровых часов — анти-эксплойт «умереть = телепорт»).
   * Вызывается сценой в обработчике 'player:died'.
   */
  respawn(): void {
    this.conditions.deactivate(E_ConditionId.Starving)
    this.conditions.deactivate(E_ConditionId.Dehydrated)
    this.conditions.activate(E_ConditionId.CarrierRestart)
    this.current = {
      hp: this.effectiveMax(E_StatType.Hp),
      hunger: this.effectiveMax(E_StatType.Hunger),
      thirst: this.effectiveMax(E_StatType.Thirst),
    }
    this.IsDead = false
    this.emitSnapshot()
  }

  /** Текущие абсолютные значения статов (копия — мутации снаружи не трогают мир). */
  get snapshot(): S_StatsSnapshot {
    return { ...this.current }
  }

  /** Находится ли инженер в состоянии смерти (до respawn). */
  get IsDeadState(): boolean {
    return this.IsDead
  }

  /** Эффективный максимум стата с учётом капов активных условий. */
  effectiveMax(type: E_StatType): number {
    const key = type as StatKey
    return this.config.max[key] * (this.conditions.getStatCapPercent() / 100)
  }

  /** Включает/выключает пороговые дебаффы по текущим значениям нужд. */
  private syncConditions(): void {
    if (this.current.hunger <= 0) this.conditions.activate(E_ConditionId.Starving)
    else this.conditions.deactivate(E_ConditionId.Starving)

    if (this.current.thirst <= 0) this.conditions.activate(E_ConditionId.Dehydrated)
    else this.conditions.deactivate(E_ConditionId.Dehydrated)
  }

  private setHp(value: number): void {
    this.current.hp = clamp(value, 0, this.effectiveMax(E_StatType.Hp))
  }

  private die(): void {
    this.IsDead = true
    this.bus.emit('player:died', { hp: 0 })
  }

  private emitSnapshot(): void {
    this.lastEmitted = { ...this.current }
    this.bus.emit('stats:changed', this.normalizedSnapshot())
  }

  /** Эмитим только при изменении, округлённом до 0.1 — не спамим HUD каждый кадр. */
  private emitIfChanged(): void {
    const keys: StatKey[] = ['hp', 'hunger', 'thirst']
    const changed = keys.some(
      (key) =>
        Math.round(this.current[key] * EMIT_PRECISION) !==
        Math.round(this.lastEmitted[key] * EMIT_PRECISION),
    )
    if (changed) this.emitSnapshot()
  }

  /** Значения 0..1 к глобальному максимуму (полоски HUD не знают про капы). */
  private normalizedSnapshot(): { hp: number; hunger: number; thirst: number } {
    const norm = (type: E_StatType): number => {
      const key = type as StatKey
      return this.current[key] / this.config.max[key]
    }
    return {
      hp: norm(E_StatType.Hp),
      hunger: norm(E_StatType.Hunger),
      thirst: norm(E_StatType.Thirst),
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
