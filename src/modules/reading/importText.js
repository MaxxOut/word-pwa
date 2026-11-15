// свой текст (внешняя книга): файл .txt / .fb2 или вставленный текст → { title, chapters: [{ title, text }] }.
// Абзацы глав — через пустую строку, как у встроенных текстов. Картинки fb2 пропускаются.
// Длинные главы режутся: книга рисует главу целиком, по элементу на слово

export const CHAPTER_MAX  = 2500 // слов: длиннее — резать
export const CHAPTER_PART = 1500 // слов в куске

// байты файла → строка: BOM, кодировка из заголовка XML, иначе UTF-8, не вышло — windows-1251
export function decodeFile(buffer) {
  const bytes = new Uint8Array(buffer)
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) return new TextDecoder('utf-16le').decode(bytes)
  if (bytes[0] === 0xFE && bytes[1] === 0xFF) return new TextDecoder('utf-16be').decode(bytes)
  const head = new TextDecoder('ascii').decode(bytes.slice(0, 200))
  const declared = head.match(/encoding=["']([\w-]+)["']/i)?.[1]
  if (declared) {
    try { return new TextDecoder(declared).decode(bytes) } catch { /* неизвестная — пробуем дальше */ }
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('windows-1251').decode(bytes)
  }
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeEntities(s) {
  return s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)))
    return ENTITIES[e.toLowerCase()] ?? m
  })
}

const clean = s => decodeEntities(s).replace(/\s+/g, ' ').trim()

// fb2: главы — секции с заголовком (вложенные — тоже), абзацы — <p>, стихи — <v>.
// Сноски (<body name="notes">) и картинки (<binary>, <image>) пропускаются
export function parseFb2(xml) {
  const title = clean(xml.match(/<book-title>([\s\S]*?)<\/book-title>/)?.[1] ?? '')
  const author = xml.match(/<title-info>[\s\S]*?<author>([\s\S]*?)<\/author>/)?.[1]
  const authorName = author ? clean(['first-name', 'last-name'].map(k => author.match(new RegExp(`<${k}>([\\s\\S]*?)</${k}>`))?.[1] ?? '').join(' ')) : ''

  const body = (xml.match(/<body(?![^>]*name=["']notes["'])[^>]*>([\s\S]*?)<\/body>/)?.[1]) ?? ''
  const chapters = []
  let current = { title: '', paras: [] }
  let inTitle = false
  let titleParts = []
  let para = null

  const flush = () => {
    if (current.paras.length) chapters.push({ title: current.title, text: current.paras.join('\n\n') })
    current = { title: '', paras: [] }
  }

  for (const [, close, tag, , text] of body.matchAll(/<(\/?)([\w-]+)([^>]*)>|([^<]+)/g)) {
    if (text !== undefined) {
      if (para !== null) para += text
      continue
    }
    if (tag === 'title') {
      if (!close) { inTitle = true; titleParts = [] }
      else {
        inTitle = false
        // заголовок новой секции: что набрано — уже глава
        flush()
        current.title = titleParts.join('. ')
      }
    } else if (tag === 'p' || tag === 'v' || tag === 'subtitle') {
      if (!close) para = ''
      else if (para !== null) {
        const p = clean(para)
        if (p) (inTitle ? titleParts : current.paras).push(p)
        para = null
      }
    }
  }
  flush()
  return { title, author: authorName, chapters: splitLong(chapters) }
}

// заголовок главы в txt: «Chapter 1», «Глава 5», «Kapitel III», «Part Two», «12», «XII»
// (граница после слова — пробел, цифра, точка, двоеточие: \b кириллицу не понимает)
const HEADING = /^(chapter|глава|розділ|kapitel|part|часть|частина|teil|book|книга)(?=[\s\d.:]|$).{0,60}$|^([IVXLC]+|\d{1,3})\.?$/i

// вставленный текст или .txt: абзацы — пустая строка; если пустых строк почти нет — каждая строка
export function parsePlain(raw) {
  // переводы строк — \n; неразрывные пробелы, табы — обычный пробел
  const text  = raw.replace(/\r\n?/g, '\n').replace(/[^\S\n]/g, ' ')
  const lines = text.split('\n')
  const blank = lines.filter(l => !l.trim()).length
  const blocks = blank < lines.length / 10
    ? lines.map(l => l.trim()).filter(Boolean)
    : text.split(/\n\s*\n/).map(b => b.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean)

  const chapters = []
  let current = { title: '', paras: [] }
  for (const b of blocks) {
    if (b.length <= 80 && HEADING.test(b)) {
      if (current.paras.length) chapters.push(current)
      current = { title: b, paras: [] }
    } else {
      current.paras.push(b)
    }
  }
  if (current.paras.length) chapters.push(current)
  // строка перед первой главой («The Happy Prince») — название книги, а не глава
  if (chapters.length > 1 && !chapters[0].title && chapters[0].paras.length === 1 && chapters[0].paras[0].length <= 80) {
    chapters.shift()
  }
  return splitLong(chapters.map(c => ({ title: c.title, text: c.paras.join('\n\n') })))
}

const wordCount = s => s.split(/\s+/).filter(Boolean).length

// глава длиннее CHAPTER_MAX слов — куски по ~CHAPTER_PART по границе абзаца: «Глава 1 (2)»
export function splitLong(chapters) {
  const out = []
  for (const c of chapters) {
    if (wordCount(c.text) <= CHAPTER_MAX) { out.push(c); continue }
    const parts = []
    let buf = []
    let n = 0
    for (const p of c.text.split('\n\n')) {
      buf.push(p)
      n += wordCount(p)
      if (n >= CHAPTER_PART) { parts.push(buf); buf = []; n = 0 }
    }
    // короткий хвост — к последнему куску
    if (buf.length) {
      if (parts.length && n < CHAPTER_PART / 3) parts[parts.length - 1].push(...buf)
      else parts.push(buf)
    }
    parts.forEach((p, i) => out.push({
      title: parts.length > 1 ? `${c.title || ''} (${i + 1})`.trim() : c.title,
      text:  p.join('\n\n'),
    }))
  }
  return out
}

export function textWords(chapters) {
  return chapters.reduce((a, c) => a + wordCount(c.text), 0)
}

// файл → { title, chapters }; название — из fb2 или из имени файла
export function parseFile(name, buffer) {
  const raw = decodeFile(buffer)
  if (/\.fb2$/i.test(name) || /<FictionBook/i.test(raw.slice(0, 1000))) {
    const book = parseFb2(raw)
    return { title: [book.title, book.author].filter(Boolean).join(' — ') || name.replace(/\.\w+$/, ''), chapters: book.chapters }
  }
  return { title: name.replace(/\.\w+$/, ''), chapters: parsePlain(raw) }
}
