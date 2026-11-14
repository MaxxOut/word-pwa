// счётчики занятий по дням — для активности на главной
export const tables = {
  sessions: { schema: '[library_id+date], library_id, date', library: ['reset', 'clear'] },
}
