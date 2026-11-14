// ошибки слоя данных — одинаковые для любого источника (local / http)

export class DuplicateWordError extends Error {
  constructor(word) {
    super(`Word already exists: ${word}`)
    this.name = 'DuplicateWordError'
    this.word = word
  }
}

export class NotFoundError extends Error {
  constructor(what) {
    super(`Not found: ${what}`)
    this.name = 'NotFoundError'
  }
}
