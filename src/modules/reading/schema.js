// место чтения: одна запись на текст; скачанные тексты — reading_texts
// (не данные библиотеки: при сбросе и очистке остаются, удаляются только вручную)
export const tables = {
  reading:       { schema: 'text_id, library_id' },
  reading_texts: { schema: 'id, library_id' },
}
