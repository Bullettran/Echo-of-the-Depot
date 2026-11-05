import { gameEvents } from '../core/event-bus'
import { Hud } from '../ui/hud/hud'

export function mountWorldToDomBridge(): void {
  const root = document.getElementById('ui')
  if (!root) throw new Error('#ui root element not found')

  const hud = new Hud(root)
  gameEvents.on('time:minute', ({ day, hour, minute }) => {
    hud.setClock(day, hour, minute)
  })
}
