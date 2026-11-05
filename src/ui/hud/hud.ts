import type { S_ConditionView, S_StatsSnapshot } from '../../data/types'

interface BarDef {
  key: keyof S_StatsSnapshot
  label: string
  className: string
}

/** Конфигурация полосок HUD: ключ стата → подпись и CSS-класс цвета. */
const BAR_DEFS: BarDef[] = [
  { key: 'hp', label: 'HP', className: 'hp' },
  { key: 'hunger', label: 'Еда', className: 'hunger' },
  { key: 'thirst', label: 'Вода', className: 'thirst' },
]

/**
 * HUD инженера (DOM поверх canvas). Только подписки через мост — никаких
 * обращений к миру (правило №3). Все методы — «показать состояние», не «спросить».
 */
export class Hud {
  private readonly clockEl: HTMLElement
  private readonly fills = new Map<keyof S_StatsSnapshot, HTMLElement>()
  private readonly conditionsEl: HTMLElement
  private readonly statusEl: HTMLElement
  private readonly promptEl: HTMLElement
  private statusTimer: number | null = null

  /** @param root — контейнер #ui, в который монтируется вся разметка HUD. */
  constructor(root: HTMLElement) {
    const hud = document.createElement('div')
    hud.id = 'hud'

    this.clockEl = document.createElement('div')
    this.clockEl.id = 'hud-clock'
    this.clockEl.className = 'hud-panel'
    this.clockEl.textContent = 'День 1 · 08:00'

    const hintEl = document.createElement('div')
    hintEl.id = 'hud-hint'
    hintEl.className = 'hud-panel'
    hintEl.textContent = 'WASD / стрелки — движение'

    // полоски статов: трек + заливка, ширина задаётся в setStats
    const barsEl = document.createElement('div')
    barsEl.id = 'stat-bars'
    for (const def of BAR_DEFS) {
      const row = document.createElement('div')
      row.className = 'stat-row'

      const label = document.createElement('span')
      label.className = 'stat-label'
      label.textContent = def.label

      const track = document.createElement('div')
      track.className = 'stat-track'
      const fill = document.createElement('div')
      fill.className = `stat-fill ${def.className}`
      track.append(fill)

      row.append(label, track)
      barsEl.append(row)
      this.fills.set(def.key, fill)
    }

    this.conditionsEl = document.createElement('div')
    this.conditionsEl.id = 'hud-conditions'

    this.statusEl = document.createElement('div')
    this.statusEl.id = 'hud-status'

    // промпт взаимодействия по центру-низу: «[E] Собрать: …»
    this.promptEl = document.createElement('div')
    this.promptEl.id = 'hud-prompt'
    this.promptEl.classList.add('hidden')

    hud.append(this.clockEl, hintEl, barsEl, this.conditionsEl, this.statusEl)
    root.append(hud, this.promptEl)
  }

  /** Обновить часы: «День N · ЧЧ:ММ» (данные приходят из 'time:minute'). */
  setClock(day: number, hour: number, minute: number): void {
    const hh = String(hour).padStart(2, '0')
    const mm = String(minute).padStart(2, '0')
    this.clockEl.textContent = `День ${day} · ${hh}:${mm}`
  }

  /** Перерисовать полоски; значения 0..1 (нормированные из 'stats:changed'). */
  setStats(stats: S_StatsSnapshot): void {
    for (const def of BAR_DEFS) {
      const fill = this.fills.get(def.key)
      if (!fill) continue
      const percent = Math.round(stats[def.key] * 100)
      fill.style.width = `${percent}%`
    }
  }

  /** Перерисовать бейджи активных состояний (красные плашки дебаффов). */
  setConditions(active: S_ConditionView[]): void {
    this.conditionsEl.replaceChildren()
    for (const condition of active) {
      const badge = document.createElement('span')
      badge.className = 'condition-badge'
      badge.textContent = condition.name
      this.conditionsEl.append(badge)
    }
  }

  /** Показать одноразовое сообщение (смерть, важное событие) на durationMs. */
  showStatus(text: string, durationMs = 3000): void {
    this.statusEl.textContent = text
    this.statusEl.classList.add('visible')
    if (this.statusTimer !== null) window.clearTimeout(this.statusTimer)
    this.statusTimer = window.setTimeout(() => {
      this.statusEl.classList.remove('visible')
      this.statusTimer = null
    }, durationMs)
  }

  /** Промпт взаимодействия: подпись цели в радиусе E или null — спрятать. */
  setPrompt(label: string | null): void {
    if (label === null) {
      this.promptEl.classList.add('hidden')
      return
    }
    this.promptEl.textContent = `[E] ${label}`
    this.promptEl.classList.remove('hidden')
  }
}
