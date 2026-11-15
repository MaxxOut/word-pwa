// генератор заданий «выбери форму»: предложение с пропуском, правильная форма и 3 неверные —
// тот же глагол в другом времени или лице. Утверждение, отрицание, вопрос (в вопросе пропуск —
// вспомогательный глагол: ___ she go…?)
import { SUBJECTS, VERBS, MARKERS } from './en.js'

const pick = (list, rnd) => list[Math.floor(rnd() * list.length)]

function shuffle(list, rnd) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ----- формы глагола -----

// 3-е лицо: watches, studies, goes, plays
export function third(v) {
  if (v === 'have') return 'has'
  if (/(s|x|z|ch|sh|o)$/.test(v)) return `${v}es`
  if (/[^aeiou]y$/.test(v)) return `${v.slice(0, -1)}ies`
  return `${v}s`
}

// -ing: writing, seeing, studying; удвоение — в данных (swim → swimming)
export function ing(verb) {
  if (verb.ing) return verb.ing
  const v = verb.v
  if (/ie$/.test(v)) return `${v.slice(0, -2)}ying`
  if (/[^e]e$/.test(v)) return `${v.slice(0, -1)}ing`
  return `${v}ing`
}

// прошедшее: неправильные — из данных, правильные — studied, played, visited
export function past(verb) {
  if (verb.past) return verb.past
  const v = verb.v
  if (/e$/.test(v)) return `${v}d`
  if (/[^aeiou]y$/.test(v)) return `${v.slice(0, -1)}ied`
  return `${v}ed`
}

const BE     = { '1s': 'am', '3s': 'is', pl: 'are' }
const BE_NOT = { '1s': 'am not', '3s': "isn't", pl: "aren't" }

// ответ (то, что в пропуске) по времени, виду и лицу
export function answerFor(tense, kind, verb, p) {
  const s3 = p === '3s'
  if (tense === 'present-simple') {
    if (kind === 'affirm')   return s3 ? third(verb.v) : verb.v
    if (kind === 'negative') return `${s3 ? "doesn't" : "don't"} ${verb.v}`
    return s3 ? 'Does' : 'Do'
  }
  if (tense === 'present-continuous') {
    if (kind === 'affirm')   return `${BE[p]} ${ing(verb)}`
    if (kind === 'negative') return `${BE_NOT[p]} ${ing(verb)}`
    return BE[p][0].toUpperCase() + BE[p].slice(1)
  }
  // past-simple
  if (kind === 'affirm')   return past(verb)
  if (kind === 'negative') return `didn't ${verb.v}`
  return 'Did'
}

// неверные варианты, по порядку важности: то же время с чужим лицом (go / goes — проверяет лицо),
// другие времена с тем же лицом, типичные ошибки
function wrongFor(tense, kind, verb, p) {
  const other = p === '3s' ? 'pl' : '3s'
  if (kind === 'question') return ['Do', 'Does', 'Did', 'Is', 'Are', 'Am', 'Was']
  const all = ['present-simple', 'present-continuous', 'past-simple']
  const list = [
    answerFor(tense, kind, verb, other),
    ...all.filter(x => x !== tense).map(x => answerFor(x, kind, verb, p)),
  ]
  if (kind === 'affirm') list.push(ing(verb), `${BE[p]} ${verb.v}`, third(verb.v), verb.v)
  else list.push(`didn't ${past(verb)}`, `doesn't ${third(verb.v)}`, `don't ${ing(verb)}`, `${BE_NOT[p]} ${verb.v}`)
  return list
}

function options(answer, wrong, rnd) {
  const pool = [...new Set(wrong.filter(w => w !== answer))]
  // первые — самые «похожие» (другие времена, чужое лицо); добираем из остальных
  const chosen = [...pool.slice(0, 2), ...shuffle(pool.slice(2), rnd)].slice(0, 3)
  return shuffle([answer, ...chosen], rnd)
}

const cap = s => s[0].toUpperCase() + s.slice(1)
// I и имена — с заглавной и внутри предложения
const inside = s => (/^(I|[A-Z][a-z]+)$/.test(s) ? s : s.toLowerCase())

// одно задание: { tense, kind, verb, irregular, before, after, marker, answer, options, sentence }.
// Подсказки «(go)» нет: глагол и так виден в вариантах, а в Present Simple она совпадала бы с ответом
export function makeItem({ tense, kind, verb, subject, object, marker }, rnd = Math.random) {
  const answer = answerFor(tense, kind, verb, subject.p)
  const tail   = `${object} ${marker}`
  let before, after
  if (kind === 'question') {
    before = ''
    const main = tense === 'present-continuous' ? ing(verb) : verb.v
    after  = `${inside(subject.t)} ${main} ${tail}?`
  } else {
    before = cap(subject.t)
    after  = `${tail}.`
  }
  const sentence = [before, answer, after].filter(Boolean).join(' ')
  return {
    tense, kind, verb: verb.v, irregular: !!verb.past,
    before, after, marker, answer,
    options:  options(answer, wrongFor(tense, kind, verb, subject.p), rnd),
    sentence,
  }
}

// тренировка: count заданий, из них irregular — с неправильными глаголами (давно не встречавшимися:
// recent — { глагол: дата }, старые первыми). Утверждений ~40 %, отрицаний и вопросов по ~30 %.
// tense — время или список (смешанная: задания поровну по временам, вперемешку)
export function makeSession(tense, { count = 10, irregular = 2, recent = {}, rnd = Math.random } = {}) {
  const tenses = shuffle(Array.from({ length: count }, (_, i) => [].concat(tense)[i % [].concat(tense).length]), rnd)
  const regular   = shuffle(VERBS.filter(v => !v.past), rnd)
  const irregulars = shuffle(VERBS.filter(v => v.past), rnd)
    .sort((a, b) => (recent[a.v] ?? '').localeCompare(recent[b.v] ?? ''))
  const verbs = shuffle([
    ...irregulars.slice(0, irregular),
    ...Array.from({ length: count - irregular }, (_, i) => regular[i % regular.length]),
  ], rnd)
  const kinds = shuffle(Array.from({ length: count }, (_, i) => (i < count * 0.4 ? 'affirm' : i < count * 0.7 ? 'negative' : 'question')), rnd)
  return verbs.map((verb, i) => makeItem({
    tense:   tenses[i],
    kind:    kinds[i],
    verb,
    subject: pick(SUBJECTS, rnd),
    object:  pick(verb.obj, rnd),
    marker:  pick(MARKERS[tenses[i]], rnd),
  }, rnd))
}
