import type { S_StationConfig } from '../../data/types'

interface ModuleRowRefs {
  fill: HTMLElement
  label: HTMLElement
}

/**
 * Панель статуса станции (правый-верх): строка на модуль с мини-баром.
 * Только подписки: начальный рендер — нули, дальше — 'station:moduleChanged'.
 */
export class StationPanel {
  private readonly rows = new Map<string, ModuleRowRefs>()

  constructor(root: HTMLElement, config: S_StationConfig) {
    const panel = document.createElement('div')
    panel.id = 'station-panel'

    const title = document.createElement('div')
    title.id = 'station-panel-title'
    title.textContent = 'Станция'
    panel.append(title)

    for (const module of Object.values(config.modules)) {
      const row = document.createElement('div')
      row.className = 'station-row'

      const label = document.createElement('span')
      label.className = 'station-label'
      label.textContent = module.name

      const track = document.createElement('div')
      track.className = 'station-track'
      const fill = document.createElement('div')
      fill.className = 'station-fill'
      track.append(fill)

      row.append(label, track)
      panel.append(row)
      this.rows.set(module.id, { fill, label })
    }
    root.append(panel)
  }

  /** Обновить строку модуля (percent 0..1); 100% подсвечивается терминальным цветом. */
  setModule(moduleId: string, percent: number): void {
    const row = this.rows.get(moduleId)
    if (!row) return
    const rounded = Math.round(percent * 100)
    row.fill.style.width = `${rounded}%`
    row.fill.classList.toggle('done', rounded >= 100)
    row.label.textContent = row.label.textContent?.replace(/\s\d+%$/, '') ?? ''
    row.label.textContent = `${row.label.textContent} ${rounded}%`
    row.label.classList.toggle('done', rounded >= 100)
  }

  /** Общий прогресс (полоска в заголовке панели). */
  setTotal(percent: number): void {
    const title = document.getElementById('station-panel-title')
    if (title) title.textContent = `Станция · ${Math.round(percent * 100)}%`
  }
}
