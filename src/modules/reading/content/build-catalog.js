// npm run texts — пересобрать catalog.js по файлам <библиотека>/<имя>.text.js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { catalogEntry } from './catalog-entry.js'

const dir     = path.dirname(fileURLToPath(import.meta.url))
const entries = []
const stale   = []   // review: 'ГГГГ-ММ' — пора обновить или удалить
const month   = new Date().toISOString().slice(0, 7)

for (const lib of fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)) {
  for (const name of fs.readdirSync(path.join(dir, lib)).filter(f => f.endsWith('.text.js'))) {
    const { default: text } = await import(pathToFileURL(path.join(dir, lib, name)).href)
    if (text.review && text.review <= month) stale.push(`${lib}/${name} (${text.review})`)
    entries.push(catalogEntry(text, `${lib}/${name.replace(/\.text\.js$/, '')}`))
  }
}
entries.sort((a, b) => a.file.localeCompare(b.file))

const out = '// создаётся командой npm run texts — руками не править\n'
  + 'export default [\n'
  + entries.map(e => `  ${JSON.stringify(e)},\n`).join('')
  + ']\n'

fs.writeFileSync(path.join(dir, 'catalog.js'), out)
console.log(`catalog.js: ${entries.length} texts`)
if (stale.length) console.warn(`Пора обновить или удалить:\n  ${stale.join('\n  ')}`)
