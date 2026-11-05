import { E_TimePhase, type S_ConditionView } from '../data/types'

type Handler<T> = (payload: T) => void

/**
 * Карта всех игровых событий — единственный «контракт» между миром и UI.
 * Ключ — канал вида `domain:eventName`, значение — тип payload'а.
 * Новое событие добавляется ТОЛЬКО сюда (правило 3 AGENTS.md: UI узнаёт мир только отсюда).
 */
export type GameEventMap = {
  'time:minute': { day: number; hour: number; minute: number }
  'time:newDay': { day: number }
  'time:phase': { phase: E_TimePhase }
  /** Значения нормированы 0..1 к глобальному максимуму стата (для полосок HUD). */
  'stats:changed': { hp: number; hunger: number; thirst: number }
  'conditions:changed': { active: S_ConditionView[] }
  'player:died': { hp: number }
}

/**
 * Типизированная шина событий — веб-замена UE Event Dispatchers.
 * Подписчики получают payload только своего канала; отписка — через возвращённую функцию.
 */
export class EventBus<M extends Record<string, unknown>> {
  private readonly handlers = new Map<keyof M, Set<Handler<never>>>()

  /**
   * Подписаться на событие.
   * @param event — канал из карты событий
   * @param handler — обработчик payload'а
   * @returns функция отписки (удобно вешать на SHUTDOWN сцены)
   */
  on<K extends keyof M & string>(event: K, handler: Handler<M[K]>): () => void {
    let set = this.handlers.get(event)
    if (!set) {
      set = new Set()
      this.handlers.set(event, set)
    }
    set.add(handler as Handler<never>)
    return () => this.off(event, handler)
  }

  /** Отписаться от события (деструктивно удаляет обработчик из набора). */
  off<K extends keyof M & string>(event: K, handler: Handler<M[K]>): void {
    this.handlers.get(event)?.delete(handler as Handler<never>)
  }

  /**
   * Разослать событие всем подписчикам канала.
   * Обработчики вызываются синхронно; порядок подписки не гарантируется.
   */
  emit<K extends keyof M & string>(event: K, payload: M[K]): void {
    const set = this.handlers.get(event)
    if (!set) return
    for (const handler of [...set]) (handler as Handler<M[K]>)(payload)
  }
}

/** Общая шина игры. Сущности/системы могут инжектить свою — синглтон для моста к DOM. */
export const gameEvents = new EventBus<GameEventMap>()
