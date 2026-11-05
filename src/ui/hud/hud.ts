export class Hud {
  private readonly clockEl: HTMLElement

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

    hud.append(this.clockEl, hintEl)
    root.append(hud)
  }

  setClock(day: number, hour: number, minute: number): void {
    const hh = String(hour).padStart(2, '0')
    const mm = String(minute).padStart(2, '0')
    this.clockEl.textContent = `День ${day} · ${hh}:${mm}`
  }
}
