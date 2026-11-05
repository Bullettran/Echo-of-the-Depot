import { E_TimePhase } from '../data/types'

type Handler<T> = (payload: T) => void

export type GameEventMap = {
  'time:minute': { day: number; hour: number; minute: number }
  'time:newDay': { day: number }
  'time:phase': { phase: E_TimePhase }
}

export class EventBus<M extends Record<string, unknown>> {
  private readonly handlers = new Map<keyof M, Set<Handler<never>>>()

  on<K extends keyof M & string>(event: K, handler: Handler<M[K]>): () => void {
    let set = this.handlers.get(event)
    if (!set) {
      set = new Set()
      this.handlers.set(event, set)
    }
    set.add(handler as Handler<never>)
    return () => this.off(event, handler)
  }

  off<K extends keyof M & string>(event: K, handler: Handler<M[K]>): void {
    this.handlers.get(event)?.delete(handler as Handler<never>)
  }

  emit<K extends keyof M & string>(event: K, payload: M[K]): void {
    const set = this.handlers.get(event)
    if (!set) return
    for (const handler of [...set]) (handler as Handler<M[K]>)(payload)
  }
}

export const gameEvents = new EventBus<GameEventMap>()
