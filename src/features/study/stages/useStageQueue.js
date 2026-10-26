// очередь слов этапа: ошибочное слово ещё раз попадает в конец.
// errorIds — слова, в которых за этап была хоть одна ошибка (уходят в итог)
import { ref, computed } from 'vue'

export function useStageQueue(words, onDone) {
  const queue     = ref([...words])
  const index     = ref(0)
  const errorIds  = ref(new Set())
  const doneCount = ref(0)

  const current  = computed(() => queue.value[index.value])
  const isLast   = computed(() => index.value === queue.value.length - 1)
  const counter  = computed(() => `${index.value + 1} / ${queue.value.length}`)
  const progress = computed(() => (doneCount.value / words.length) * 100)

  function markError() {
    errorIds.value.add(current.value.id)
  }

  // ответ неверный — запомнить и повторить в конце
  function fail() {
    markError()
    queue.value.push({ ...current.value })
  }

  function succeed() {
    doneCount.value++
  }

  // false — очередь кончилась, этап завершён
  function next() {
    if (isLast.value) {
      onDone([...errorIds.value])
      return false
    }
    index.value++
    return true
  }

  return { current, isLast, counter, progress, markError, fail, succeed, next }
}
