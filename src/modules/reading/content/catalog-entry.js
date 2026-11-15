// строка каталога: всё о тексте, кроме самого текста — списки работают без загрузки.
// Общая для скрипта сборки каталога (Node) и теста, что каталог не устарел
export function catalogEntry(text, file) {
  const json = JSON.stringify(text)
  return {
    id:         text.id,
    library_id: file.split('/')[0],
    file,
    topic:      text.topic,
    level:      text.level,
    added:      text.added,
    title:      text.title,
    chapters:   text.chapters.map(c => c.title ?? ''),
    bytes:      new TextEncoder().encode(json).length,
    hash:       hash(json),
  }
}

// djb2 — текст поменялся → скачанная копия устарела
function hash(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0
  return h.toString(36)
}
