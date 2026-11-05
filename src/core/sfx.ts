/** Синтезированные звуки без ассетов (WebAudio). Заменяются файлами в W6. */

let context: AudioContext | null = null

function getContext(): AudioContext {
  context ??= new AudioContext()
  return context
}

/** Поездной гудок: два тона вместе с нарастанием и затуханием (~1.6 c). */
export function playHorn(): void {
  const audio = getContext()
  const now = audio.currentTime

  const gain = audio.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.15)
  gain.gain.setValueAtTime(0.18, now + 1.1)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6)
  gain.connect(audio.destination)

  // низкая нота + квинта — «тяжёлый» состав
  for (const freq of [138, 207]) {
    const osc = audio.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    osc.connect(gain)
    osc.start(now)
    osc.stop(now + 1.6)
  }
}
