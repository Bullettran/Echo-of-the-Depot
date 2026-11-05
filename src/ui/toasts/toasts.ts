/**
 * Тосты-уведомления (правый-низ): «+3 Металлолом», «Рюкзак полон».
 * Стек до 4 штук, авто-скрытие через 2.5 с, DOM без обращений к миру.
 */
export class Toasts {
  private readonly containerEl: HTMLElement
  private readonly MAX_VISIBLE = 4
  private readonly LIFETIME_MS = 2500

  /** @param root — контейнер #ui. */
  constructor(root: HTMLElement) {
    this.containerEl = document.createElement('div')
    this.containerEl.id = 'toasts'
    root.append(this.containerEl)
  }

  /** Показать тост; если на экране максимум — старейший удаляется сразу. */
  show(text: string): void {
    while (this.containerEl.children.length >= this.MAX_VISIBLE) {
      this.containerEl.firstElementChild?.remove()
    }
    const toast = document.createElement('div')
    toast.className = 'toast'
    toast.textContent = text
    this.containerEl.append(toast)
    window.setTimeout(() => toast.remove(), this.LIFETIME_MS)
  }
}
