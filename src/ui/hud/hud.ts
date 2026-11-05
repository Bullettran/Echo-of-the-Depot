import type { S_ConditionView, S_StatsSnapshot } from '../../data/types'

interface BarDef {
  key: keyof S_StatsSnapshot
  label: string
  className: string
}

const BAR_DEFS: BarDef[] = [
  { key: 'hp', label: 'HP', className: 'hp' },
  { key: 'hunger', label: 'Еда', className: 'hunger' },
  { key: 'thirst', label: 'Вода', className: 'thirst' },
]

export class Hud {
  private readonly clockEl: HTMLElement
  private readonly fills = new Map<keyof S_StatsSnapshot, HTMLElement>()
  private readonly conditionsEl: HTMLElement
  private readonly statusEl: HTMLElement
  private statusTimer: number | null = null

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

    hud.append(this.clockEl, hintEl, barsEl, this.conditionsEl, this.statusEl)
    root.append(hud)
  }

  setClock(day: number, hour: number, minute: number): void {
    const hh = String(hour).padStart(2, '0')
    const mm = String(minute).padStart(2, '0')
    this.clockEl.textContent = `День ${day} · ${hh}:${mm}`
  }

  setStats(stats: S_StatsSnapshot): void {
    for (const def of BAR_DEFS) {
      const fill = this.fills.get(def.key)
      if (!fill) continue
      const percent = Math.round(stats[def.key] * 100)
      fill.style.width = `${percent}%`
    }
  }

  setConditions(active: S_ConditionView[]): void {
    this.conditionsEl.replaceChildren()
    for (const condition of active) {
      const badge = document.createElement('span')
      badge.className = 'condition-badge'
      badge.textContent = condition.name
      this.conditionsEl.append(badge)
    }
  }

  showStatus(text: string, durationMs = 3000): void {
    this.statusEl.textContent = text
    this.statusEl.classList.add('visible')
    if (this.statusTimer !== null) window.clearTimeout(this.statusTimer)
    this.statusTimer = window.setTimeout(() => {
      this.statusEl.classList.remove('visible')
      this.statusTimer = null
    }, durationMs)
  }
}
