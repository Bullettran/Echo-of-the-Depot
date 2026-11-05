import { playHorn } from '../../core/sfx'

/**
 * Финал вертикального среза: полноэкранный титр «СТАНЦИЯ ОЖИЛА» + гудок.
 * Показывается один раз на 'station:completed', закрывается кнопкой.
 */
export class CompletionOverlay {
  private readonly overlayEl: HTMLElement

  constructor(root: HTMLElement) {
    this.overlayEl = document.createElement('div')
    this.overlayEl.id = 'completion-overlay'
    this.overlayEl.classList.add('hidden')

    const title = document.createElement('div')
    title.className = 'completion-title'
    title.textContent = 'СТАНЦИЯ ОЖИЛА'

    const sub = document.createElement('div')
    sub.className = 'completion-sub'
    sub.textContent = 'Реактор запущен · Ворота открыты · Вышка в сети'

    const button = document.createElement('button')
    button.className = 'completion-btn'
    button.textContent = 'Продолжить'
    button.addEventListener('click', () => this.overlayEl.classList.add('hidden'))

    this.overlayEl.append(title, sub, button)
    root.append(this.overlayEl)
  }

  /** Показать титр и сыграть гудок. */
  show(): void {
    this.overlayEl.classList.remove('hidden')
    playHorn()
  }
}
