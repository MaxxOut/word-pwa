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

// 3-я форма: неправильные — из данных (gone, eaten), иначе как прошедшее (made, worked)
export function pp(verb) {
  return verb.pp ?? past(verb)
}

const BE       = { '1s': 'am', '3s': 'is', pl: 'are' }
const BE_NOT   = { '1s': 'am not', '3s': "isn't", pl: "aren't" }
const WAS      = { '1s': 'was', '3s': 'was', pl: 'were' }
const WAS_NOT  = { '1s': "wasn't", '3s': "wasn't", pl: "weren't" }
const HAVE     = { '1s': 'have', '3s': 'has', pl: 'have' }
const HAVE_NOT = { '1s': "haven't", '3s': "hasn't", pl: "haven't" }

const cap = s => s[0].toUpperCase() + s.slice(1)

// времена генератора: + / − / ? (вспомогательный глагол) и форма смыслового глагола в вопросе
const FORMS = {
  'present-simple': {
    affirm:   (verb, p) => (p === '3s' ? third(verb.v) : verb.v),
    negative: (verb, p) => `${p === '3s' ? "doesn't" : "don't"} ${verb.v}`,
    question: p => (p === '3s' ? 'Does' : 'Do'),
    main:     verb => verb.v,
  },
  'present-continuous': {
    affirm:   (verb, p) => `${BE[p]} ${ing(verb)}`,
    negative: (verb, p) => `${BE_NOT[p]} ${ing(verb)}`,
    question: p => cap(BE[p]),
    main:     ing,
  },
  'past-simple': {
    affirm:   verb => past(verb),
    negative: verb => `didn't ${verb.v}`,
    question: () => 'Did',
    main:     verb => verb.v,
  },
  'future-simple': {
    affirm:   verb => `will ${verb.v}`,
    negative: verb => `won't ${verb.v}`,
    question: () => 'Will',
    main:     verb => verb.v,
  },
  'past-continuous': {
    affirm:   (verb, p) => `${WAS[p]} ${ing(verb)}`,
    negative: (verb, p) => `${WAS_NOT[p]} ${ing(verb)}`,
    question: p => cap(WAS[p]),
    main:     ing,
  },
  'present-perfect': {
    affirm:   (verb, p) => `${HAVE[p]} ${pp(verb)}`,
    negative: (verb, p) => `${HAVE_NOT[p]} ${pp(verb)}`,
    question: p => cap(HAVE[p]),
    main:     pp,
  },
}

export const GENERATED = Object.keys(FORMS)

// с этим маркером форма другого времени тоже верна — её в неверные не берём:
// «She is going there tomorrow», «I cooked dinner at 8 pm yesterday», «I watched TV this week»,
// «I am playing football this week» / «I have played football this week»
const ALSO_RIGHT = {
  'present-continuous': ['future-simple', 'present-perfect'],
  'future-simple':      ['present-continuous'],
  'past-simple':        ['past-continuous'],
  'past-continuous':    ['past-simple'],
  'present-perfect':    ['past-simple', 'present-continuous'],
}

// ответ (то, что в пропуске) по времени, виду и лицу
export function answerFor(tense, kind, verb, p) {
  const form = FORMS[tense]
  return kind === 'question' ? form.question(p) : form[kind](verb, p)
}

// неверные варианты, по порядку важности: то же время с чужим лицом (go / goes — проверяет лицо),
// другие времена с тем же лицом (сначала — времена этой тренировки), типичные ошибки
function wrongFor(tense, kind, verb, p, related, rnd) {
  const other  = p === '3s' ? 'pl' : '3s'
  const skip   = [tense, ...(kind === 'question' ? [] : ALSO_RIGHT[tense] ?? [])]
  const tenses = [
    ...shuffle(related.filter(x => !skip.includes(x)), rnd),
    ...shuffle(GENERATED.filter(x => !skip.includes(x) && !related.includes(x)), rnd),
  ]
  const list = [answerFor(tense, kind, verb, other), ...tenses.map(x => answerFor(x, kind, verb, p))]
  if (kind === 'question') {
    list.push('Do', 'Does', 'Did', 'Is', 'Are', 'Am', 'Was', 'Were', 'Will', 'Have', 'Has')
  } else if (kind === 'affirm') {
    list.push(ing(verb), `${BE[p]} ${verb.v}`, `will ${third(verb.v)}`, `${HAVE[p]} ${verb.v}`, third(verb.v), verb.v)
    if (pp(verb) !== past(verb)) list.push(`${HAVE[p]} ${past(verb)}`)
  } else {
    list.push(`didn't ${past(verb)}`, `doesn't ${third(verb.v)}`, `don't ${ing(verb)}`, `${BE_NOT[p]} ${verb.v}`, `won't ${ing(verb)}`)
    if (pp(verb) !== past(verb)) list.push(`${HAVE_NOT[p]} ${past(verb)}`)
  }
  // read = read: форма другого времени совпала с «тоже верной»
  const right = kind === 'question' ? [] : (ALSO_RIGHT[tense] ?? []).map(x => answerFor(x, kind, verb, p))
  return list.filter(x => !right.includes(x))
}

function options(answer, wrong, rnd) {
  const pool = [...new Set(wrong.filter(w => w !== answer))]
  // первые — самые «похожие» (другие времена, чужое лицо); добираем из остальных
  const chosen = [...pool.slice(0, 2), ...shuffle(pool.slice(2), rnd)].slice(0, 3)
  return shuffle([answer, ...chosen], rnd)
}

// I и имена — с заглавной и внутри предложения
const inside = s => (/^(I|[A-Z][a-z]+)$/.test(s) ? s : s.toLowerCase())

// одно задание: { tense, kind, verb, irregular, before, after, marker, answer, options, sentence }.
// Подсказки «(go)» нет: глагол и так виден в вариантах, а в Present Simple она совпадала бы с ответом
// related — времена этой тренировки: их формы — первые среди неверных
export function makeItem({ tense, kind, verb, subject, object, marker, related = [] }, rnd = Math.random) {
  const answer = answerFor(tense, kind, verb, subject.p)
  const tail   = `${object} ${marker}`
  let before, after
  if (kind === 'question') {
    before = ''
    after  = `${inside(subject.t)} ${FORMS[tense].main(verb)} ${tail}?`
  } else {
    before = cap(subject.t)
    after  = `${tail}.`
  }
  const sentence = [before, answer, after].filter(Boolean).join(' ')
  return {
    tense, kind, verb: verb.v, irregular: !!verb.past,
    before, after, marker, answer,
    options:  options(answer, wrongFor(tense, kind, verb, subject.p, related, rnd), rnd),
    sentence,
  }
}

// тренировка: count заданий, из них irregular — с неправильными глаголами (давно не встречавшимися:
// recent — { глагол: дата }, старые первыми). Утверждений ~40 %, отрицаний и вопросов по ~30 % —
// в каждом времени. tense — время или список (смешанная: задания поровну по временам, вперемешку)
const kindOf = (i, n) => (i < n * 0.4 ? 'affirm' : i < n * 0.7 ? 'negative' : 'question')

export function makeSession(tense, { count = 10, irregular = 2, recent = {}, rnd = Math.random } = {}) {
  const list  = [].concat(tense)
  const slots = shuffle(list.flatMap((x, ti) => {
    const n = Math.floor(count / list.length) + (ti < count % list.length ? 1 : 0)
    return Array.from({ length: n }, (_, i) => ({ tense: x, kind: kindOf(i, n) }))
  }), rnd)
  const regular   = shuffle(VERBS.filter(v => !v.past), rnd)
  const irregulars = shuffle(VERBS.filter(v => v.past), rnd)
    .sort((a, b) => (recent[a.v] ?? '').localeCompare(recent[b.v] ?? ''))
  const verbs = shuffle([
    ...irregulars.slice(0, irregular),
    ...Array.from({ length: count - irregular }, (_, i) => regular[i % regular.length]),
  ], rnd)
  return verbs.map((verb, i) => makeItem({
    ...slots[i],
    verb,
    subject: pick(SUBJECTS, rnd),
    object:  pick(verb.obj, rnd),
    marker:  pick(MARKERS[slots[i].tense], rnd),
    related: list,
  }, rnd))
}
