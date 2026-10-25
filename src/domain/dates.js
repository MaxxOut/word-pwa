// работа с датами — всё в локальном времени устройства

export function nowIso() {
  return new Date().toISOString()
}

// 'YYYY-MM-DD' по локальному времени (toISOString дал бы UTC и сдвинул день)
export function localDate(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function daysAgo(days, from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() - days)
  return d
}

// последние N дней, от старого к новому
export function lastDays(count, from = new Date()) {
  const days = []
  for (let i = count - 1; i >= 0; i--) days.push(localDate(daysAgo(i, from)))
  return days
}
