// единая точка доступа к данным.
// Экраны и stores работают только через этот модуль и не знают, откуда данные.
// Если появится бэкенд — добавить data/http с тем же набором методов
// и выбирать реализацию по import.meta.env.VITE_DATA_SOURCE.

import local from './local/index.js'

const repo = local

export const { settings, libraries, words, study, repeat, stats, reading, maintenance } = repo
export { DuplicateWordError, NotFoundError } from './errors.js'
