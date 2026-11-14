// Правила устройства проекта (см. CLAUDE.md → «Архитектура»). Падает — значит, нарушена граница.
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { composeMessages } from '@/core/i18n/index.js'
import { composeSchema, SCHEMA_VERSION } from '@/core/db.js'

const SRC     = path.resolve(__dirname, '../src')
const rel     = file => path.relative(SRC, file).split(path.sep).join('/')
const MODULES = fs.readdirSync(path.join(SRC, 'modules'))

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])
}

const files = walk(SRC).filter(f => /\.(js|vue)$/.test(f))

// путь импорта → путь от src ('core/db.js') или null для пакетов
function resolveImport(file, spec) {
  if (spec.startsWith('@/')) return spec.slice(2)
  if (spec.startsWith('.')) return rel(path.resolve(path.dirname(file), spec))
  return null
}

function importsOf(file) {
  const src = fs.readFileSync(file, 'utf8')
  return [...src.matchAll(/(?:from\s+|import\s*\(?\s*)['"]([^'"]+)['"]/g)]
    .map(m => resolveImport(file, m[1].split('?')[0]))
    .filter(Boolean)
}

const area = p => {
  const [top, name] = p.split('/')
  return top === 'modules' ? `modules/${name}` : top
}

describe('границы', () => {
  it('модуль не импортирует другие модули', () => {
    const bad = []
    for (const file of files.filter(f => rel(f).startsWith('modules/'))) {
      const own = area(rel(file))
      for (const target of importsOf(file)) {
        if (target.startsWith('modules/') && area(target) !== own) bad.push(`${rel(file)} → ${target}`)
      }
    }
    expect(bad).toEqual([])
  })

  it('ядро знает о модулях только через реестр (import.meta.glob), shared — ни о ком', () => {
    const bad = []
    for (const file of files) {
      const from = area(rel(file))
      if (from.startsWith('modules/') || rel(file).endsWith('.test.js')) continue
      for (const target of importsOf(file)) {
        const to = area(target)
        if (to.startsWith('modules/')) bad.push(`${rel(file)} → ${target}`)
        if (from === 'shared' && to === 'core') bad.push(`${rel(file)} → ${target}`)
      }
    }
    expect(bad).toEqual([])
  })
})

describe('переводы', () => {
  const messages = composeMessages()

  const keys = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`])

  const has = (obj, key) => key.split('.').reduce((o, k) => o?.[k], obj) !== undefined

  it('ru и uk — одинаковые ключи', () => {
    const ru = keys(messages.ru).sort()
    const uk = keys(messages.uk).sort()
    expect(uk.filter(k => !ru.includes(k))).toEqual([])
    expect(ru.filter(k => !uk.includes(k))).toEqual([])
  })

  // только ключи-строки: t('a.b') и label: 'a.b' в index.js модулей; t(`a.${x}`) не проверяется
  it('ключи из кода есть в переводах; модуль берёт только свои ключи и ключи ядра', () => {
    const missing = []
    const foreign = []
    for (const file of files) {
      const src = fs.readFileSync(file, 'utf8')
      const used = [
        ...src.matchAll(/\$?\bt\(\s*'([\w.]+)'/g),
        ...src.matchAll(/\b(?:label|title):\s*'([a-z]\w*\.[\w.]+)'/g),
      ].map(m => m[1])
      const own = area(rel(file))
      for (const key of used) {
        if (!has(messages.ru, key)) missing.push(`${rel(file)}: ${key}`)
        const ns = key.split('.')[0]
        if (MODULES.includes(ns) && own !== `modules/${ns}`) foreign.push(`${rel(file)}: ${key}`)
      }
    }
    expect(missing).toEqual([])
    expect(foreign).toEqual([])
  })
})

describe('база', () => {
  // История схем. Схема изменилась (таблица/индекс, модуль добавлен или удалён) —
  // поднять SCHEMA_VERSION в core/db.js и ДОПИСАТЬ сюда новую версию. Старые не трогать.
  const SCHEMAS = {
    2: {
      libraries: 'id',
      words:     'id, library_id, [library_id+word_lc]',
      meta:      'key',
      sessions:  '[library_id+date], library_id, date',
      reading:   'text_id, library_id',
    },
    // формы слова (2026-11-14)
    3: {
      libraries: 'id',
      words:     'id, library_id, [library_id+word_lc], *form_keys',
      meta:      'key',
      sessions:  '[library_id+date], library_id, date',
      reading:   'text_id, library_id',
    },
  }

  it('схема совпадает с записанной для текущей версии', () => {
    expect(SCHEMA_VERSION).toBe(Math.max(...Object.keys(SCHEMAS).map(Number)))
    expect(composeSchema()).toEqual(SCHEMAS[SCHEMA_VERSION])
  })
})

describe('о приложении', async () => {
  const { CHANGELOG } = await import('@/core/changelog.js')

  it('у каждой версии пункты на обоих языках, новые сверху', () => {
    for (const v of CHANGELOG) {
      expect(v.items.ru.length, v.version).toBeGreaterThan(0)
      expect(v.items.uk.length, v.version).toBe(v.items.ru.length)
    }
    const dates = CHANGELOG.map(v => v.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })
})
