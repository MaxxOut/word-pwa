// итог тренировки: процент верных с первого раза и сравнение с прошлой тренировкой этой темы
export function percentOf(correct, total) {
  return total ? Math.round((correct / total) * 100) : 0
}

// first — раньше не тренировали; better / same / worse — относительно прошлого процента
export function trend(percent, prev) {
  if (prev === null || prev === undefined) return 'first'
  if (percent > prev) return 'better'
  if (percent < prev) return 'worse'
  return 'same'
}

export const REPEAT_DAYS = 7 // через сколько дней тема снова «на очереди»

// сколько календарных дней прошло (сегодня — 0, вчера — 1)
export function daysSince(iso, now = new Date()) {
  const day = d => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((day(now) - day(new Date(iso))) / 86400000)
}

// ключ перевода «когда»: сегодня / вчера / N дн. назад
export const whenKey = days => (days === 0 ? 'grammar.home.today' : days === 1 ? 'grammar.home.yesterday' : 'grammar.home.daysAgo')

// что на очереди: самая давняя тема, которой пора на повторение; иначе первая не тренированная;
// иначе null. tenses — готовые по порядку, stats — Map тема → результат
export function nextTopic(tenses, stats, now = new Date(), days = REPEAT_DAYS) {
  const due = tenses
    .filter(x => stats.has(x.id) && daysSince(stats.get(x.id).practiced_at, now) >= days)
    .sort((a, b) => stats.get(a.id).practiced_at.localeCompare(stats.get(b.id).practiced_at))
  if (due.length) return { kind: 'due', tense: due[0], row: stats.get(due[0].id), days: daysSince(stats.get(due[0].id).practiced_at, now) }
  const fresh = tenses.find(x => !stats.has(x.id))
  return fresh ? { kind: 'new', tense: fresh } : null
}
