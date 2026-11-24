// уровни тренировки времени: 1 — генератор с маркером, 2 — живые фразы без маркера,
// 3 — предложения с несколькими глаголами в разных временах (пропуски по очереди).
// Задание любого уровня — одного вида: texts (кусочки текста между пропусками, их на 1 больше),
// gaps [{ answer, options, hint?, tense }], ctx (фраза-контекст), ru / uk (перевод), sentence (целиком)
import { makeSession, answerFor, wrongFor, options, shuffle } from './generate.js'
import { LEVEL2, LEVEL3 } from './phrases.js'

export const LEVELS = [1, 2, 3]

// уровни, для которых у времени есть задания
export function levelsOf(tense) {
  return LEVELS.filter(l => l === 1 || (l === 2 ? LEVEL2 : LEVEL3)[tense]?.length)
}

// уровень из настроек; у времени (у всех времён смешанной) такого нет — первый
export function levelFor(tenses, level) {
  return [].concat(tenses).every(x => levelsOf(x).includes(level)) ? level : 1
}

// 'go/went/gone/going' → { v, past, pp, ing }
export function parseVerb(spec) {
  const [v, past, pp, ing] = spec.split('/')
  return { v, ...(past && { past }), ...(pp && { pp }), ...(ing && { ing }) }
}

const fill = (texts, values) => texts.map((s, i) => s + (values[i] ?? '')).join('')

// задание генератора (один пропуск) → общий вид
export function fromGenerated(item) {
  const texts = [item.before ? `${item.before} ` : '', ` ${item.after}`]
  return { ...item, level: 1, texts, gaps: [{ answer: item.answer, options: item.options, tense: item.tense }] }
}

// фраза уровня 2: ответ и варианты — от генератора
export function level2Item(tense, [ctx, text, spec, p, kind, ru, uk], rnd = Math.random) {
  const verb   = parseVerb(spec)
  const answer = answerFor(tense, kind, verb, p)
  const texts  = text.split('___')
  return {
    tense, level: 2, kind, verb: verb.v, irregular: false, ctx, ru, uk, texts,
    gaps:     [{ answer, options: options(answer, wrongFor(tense, kind, verb, p, [], rnd), rnd), tense }],
    sentence: fill(texts, [answer]),
  }
}

const GAP = /___\(([^)]+)\)/

// фраза уровня 3: ___(глагол) — пропуски с подсказкой; варианты заданы вручную
export function level3Item(tense, [text, gaps, ru, uk], rnd = Math.random) {
  const parts = text.split(GAP) // текст, подсказка, текст, подсказка, …, текст
  const texts = parts.filter((_, i) => i % 2 === 0)
  const hints = parts.filter((_, i) => i % 2 === 1)
  return {
    tense, level: 3, irregular: false, ctx: '', ru, uk, texts,
    gaps: gaps.map(([gapTense, answer, ...wrong], i) => ({
      answer, tense: gapTense, hint: hints[i], options: shuffle([answer, ...wrong], rnd),
    })),
    sentence: fill(texts, gaps.map(g => g[1])),
  }
}

// задание засчитано, если все пропуски — с первого раза; picks — выбранные варианты по порядку
export function isRight(item, picks) {
  return item.gaps.every((g, i) => picks[i] === g.answer)
}

// тренировка уровня: tense — время или список (смешанная — поровну на каждое, вперемешку)
export function makeLevelSession(tense, level, { count = 10, irregular, recent, rnd = Math.random } = {}) {
  if (level === 1) return makeSession(tense, { count, irregular, recent, rnd }).map(fromGenerated)
  const list  = [].concat(tense)
  const items = list.flatMap((x, ti) => {
    const n    = Math.floor(count / list.length) + (ti < count % list.length ? 1 : 0)
    const pool = shuffle(level === 2 ? LEVEL2[x] : LEVEL3[x], rnd).slice(0, n)
    return pool.map(row => (level === 2 ? level2Item(x, row, rnd) : level3Item(x, row, rnd)))
  })
  return shuffle(items, rnd)
}

// сколько заданий в тренировке: на уровне 3 предложения длинные — 6
export const countFor = level => (level === 3 ? 6 : 10)
