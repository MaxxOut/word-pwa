// английские времена: список (12, активные — с теорией и тренировкой), сгруппированный по виду
// (simple, continuous, perfect, perfect-continuous; внутри — настоящее, прошедшее, будущее), и материал для генератора.
// Предложение = [кто] + [глагол во времени] + [дополнение этого глагола] + [маркер времени]

export const TENSE_GROUPS = ['simple', 'continuous', 'perfect', 'perfect-continuous']

export const TENSES = [
  { id: 'present-simple',             group: 'simple',             name: 'Present Simple',             active: true },
  { id: 'past-simple',                group: 'simple',             name: 'Past Simple',                active: true },
  { id: 'future-simple',              group: 'simple',             name: 'Future Simple',              active: true },
  { id: 'present-continuous',         group: 'continuous',         name: 'Present Continuous',         active: true },
  { id: 'past-continuous',            group: 'continuous',         name: 'Past Continuous',            active: true },
  { id: 'future-continuous',          group: 'continuous',         name: 'Future Continuous' },
  { id: 'present-perfect',            group: 'perfect',            name: 'Present Perfect',            active: true },
  { id: 'past-perfect',               group: 'perfect',            name: 'Past Perfect' },
  { id: 'future-perfect',             group: 'perfect',            name: 'Future Perfect' },
  { id: 'present-perfect-continuous', group: 'perfect-continuous', name: 'Present Perfect Continuous' },
  { id: 'past-perfect-continuous',    group: 'perfect-continuous', name: 'Past Perfect Continuous' },
  { id: 'future-perfect-continuous',  group: 'perfect-continuous', name: 'Future Perfect Continuous' },
]

// p — лицо: 1s (I), 3s (he, she, Tom), pl (you, we, they — для глаголов одно и то же)
export const SUBJECTS = [
  { t: 'I', p: '1s' },
  { t: 'you', p: 'pl' },
  { t: 'he', p: '3s' },
  { t: 'she', p: '3s' },
  { t: 'we', p: 'pl' },
  { t: 'they', p: 'pl' },
  { t: 'Tom', p: '3s' },
  { t: 'Anna', p: '3s' },
  { t: 'my parents', p: 'pl' },
  { t: 'my friend', p: '3s' },
]

// глагол и подходящие ему дополнения (чтобы не вышло «visits to the river»).
// Неправильные — с past и pp (3-я форма, если отличается от past); ing — если правило не годится (swim → swimming)
export const VERBS = [
  { v: 'watch',  obj: ['a film', 'TV', 'the news', 'football'] },
  { v: 'play',   obj: ['football', 'the guitar', 'chess', 'video games'] },
  { v: 'work',   obj: ['at home', 'in the garden', 'in an office', 'late'] },
  { v: 'cook',   obj: ['dinner', 'pasta', 'soup', 'breakfast'] },
  { v: 'visit',  obj: ['the grandparents', 'the museum', 'friends', 'the zoo'] },
  { v: 'clean',  obj: ['the kitchen', 'the house', 'the car', 'the windows'] },
  { v: 'study',  obj: ['English', 'maths', 'for the exam', 'history'] },
  { v: 'listen', obj: ['to music', 'to the radio', 'to podcasts', 'to the teacher'] },
  { v: 'help',   obj: ['the neighbours', 'a friend', 'in the kitchen', 'at school'] },
  { v: 'wait',   obj: ['for the bus', 'for a friend', 'for the train', 'outside'] },

  { v: 'go',     past: 'went', pp: 'gone',   obj: ['to the park', 'to the cinema', 'to work', 'to the gym'] },
  { v: 'buy',    past: 'bought', obj: ['bread', 'fruit', 'a newspaper', 'coffee'] },
  { v: 'eat',    past: 'ate', pp: 'eaten',    obj: ['pizza', 'breakfast', 'an apple', 'lunch at work'] },
  { v: 'drink',  past: 'drank', pp: 'drunk',  obj: ['tea', 'coffee', 'juice', 'water'] },
  { v: 'read',   past: 'read',   obj: ['a book', 'the news', 'a magazine', 'comics'] },
  { v: 'write',  past: 'wrote', pp: 'written',  obj: ['an email', 'a letter', 'a story', 'a report'] },
  { v: 'take',   past: 'took', pp: 'taken',   obj: ['the bus', 'photos', 'a taxi', 'the train'] },
  { v: 'make',   past: 'made',   obj: ['a cake', 'tea', 'a plan', 'sandwiches'] },
  { v: 'meet',   past: 'met',    obj: ['friends', 'a colleague', 'the new teacher', 'the neighbours'] },
  { v: 'drive',  past: 'drove', pp: 'driven',  obj: ['to work', 'to the city', 'a truck', 'home'] },
  { v: 'sleep',  past: 'slept',  obj: ['late', 'at home', 'on the sofa', 'well'] },
  { v: 'swim',   past: 'swam', pp: 'swum', ing: 'swimming', obj: ['in the pool', 'in the sea', 'in the lake', 'fast'] },
]

// маркеры — в конце предложения: подсказывают время
export const MARKERS = {
  'present-simple':     ['every day', 'every weekend', 'on Mondays', 'twice a week', 'every evening'],
  'present-continuous': ['right now', 'at the moment', 'now', 'this week'],
  'past-simple':        ['yesterday', 'last week', 'last Saturday', 'two days ago', 'in 2020', 'last night'],
  'future-simple':      ['tomorrow', 'next week', 'next year', 'next Monday', 'soon'],
  'past-continuous':    ['at 8 pm yesterday', 'at that moment', 'at this time yesterday', 'when the phone rang', 'all evening yesterday'],
  'present-perfect':    ['recently', 'lately', 'this week', 'this month', 'today'],
}
