import { ref, computed, onUnmounted } from 'vue'

export function useCooldown() {
  const isActive = ref(false)
  const remainingSeconds = ref(0)
  const totalDuration = ref(0)
  let timerId: ReturnType<typeof setInterval> | null = null

  const progressPercent = computed<number>(() => {
    if (totalDuration.value <= 0 || !isActive.value) return 0
    const elapsed = totalDuration.value - remainingSeconds.value
    return Math.min(100, Math.max(0, (elapsed / totalDuration.value) * 100))
  })

  function startCooldown(seconds: number) {
    if (seconds <= 0) return

    clearTimer()
    totalDuration.value = seconds
    remainingSeconds.value = seconds
    isActive.value = true

    timerId = setInterval(() => {
      if (remainingSeconds.value > 1) {
        remainingSeconds.value -= 1
      } else {
        resetCooldown()
      }
    }, 1000)
  }

  function resetCooldown() {
    clearTimer()
    isActive.value = false
    remainingSeconds.value = 0
    totalDuration.value = 0
  }

  function clearTimer() {
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
  }

  onUnmounted(() => {
    clearTimer()
  })

  return {
    isActive,
    remainingSeconds,
    progressPercent,
    startCooldown,
    resetCooldown,
  }
}
