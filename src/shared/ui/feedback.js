// уведомления и подтверждения — вызываются из любого места, рисует их UiFeedbackHost
import { reactive } from 'vue'

export const feedback = reactive({
  toasts:  [],   // { id, text, type }
  confirm: null, // { title, message, confirmText, cancelText, danger, resolve }
})

let nextId = 1

// type: info | success | error
export function toast(text, type = 'info', duration = 2500) {
  const id = nextId++
  feedback.toasts.push({ id, text, type })
  setTimeout(() => {
    const i = feedback.toasts.findIndex(t => t.id === id)
    if (i !== -1) feedback.toasts.splice(i, 1)
  }, duration)
}

toast.success = text => toast(text, 'success')
toast.error   = text => toast(text, 'error', 4000)

// Promise<boolean>: true — подтвердили.
// history: false — из охранника роутера: своя запись в истории сломала бы откат перехода
export function confirm({ title = '', message, confirmText, cancelText, danger = false, history = true }) {
  feedback.confirm?.resolve(false)
  return new Promise(resolve => {
    feedback.confirm = { title, message, confirmText, cancelText, danger, history, resolve }
  })
}
