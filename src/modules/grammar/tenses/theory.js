// теория времён: смысл, когда употребляется, формулы, маркеры, подводные камни, примеры [en, ru, uk].
// Формулы и маркеры — на английском (одни для ru и uk), объяснения — на языке интерфейса
export const THEORY = {
  'present-simple': {
    meaning: { ru: 'Регулярно, обычно, всегда', uk: 'Регулярно, зазвичай, завжди' },
    uses: {
      ru: ['Привычки и повторяющиеся действия: I drink coffee every morning.', 'Факты и то, что верно всегда: Water boils at 100 °C.', 'Расписания: The train leaves at 6.'],
      uk: ['Звички й дії, що повторюються: I drink coffee every morning.', 'Факти й те, що правдиво завжди: Water boils at 100 °C.', 'Розклади: The train leaves at 6.'],
    },
    form: [
      ['+', 'I / you / we / they work', 'he / she / it works'],
      ['−', "I / you / we / they don't work", "he / she / it doesn't work"],
      ['?', 'Do you work?', 'Does she work?'],
    ],
    markers: ['every day', 'usually', 'often', 'on Mondays', 'twice a week'],
    notes: {
      ru: ['he / she / it → глагол с -s: works, goes, watches, studies.', 'В отрицании и вопросе -s уходит в does: She doesn’t work (не doesn’t works).'],
      uk: ['he / she / it → дієслово з -s: works, goes, watches, studies.', 'У запереченні та питанні -s переходить у does: She doesn’t work (не doesn’t works).'],
    },
    examples: [
      ['We go to the park every weekend.', 'Мы ходим в парк каждые выходные.', 'Ми ходимо до парку щовихідних.'],
      ["Tom doesn't watch TV in the morning.", 'Том не смотрит телевизор по утрам.', 'Том не дивиться телевізор уранці.'],
      ['Does your friend play chess?', 'Твой друг играет в шахматы?', 'Твій друг грає в шахи?'],
    ],
  },

  'present-continuous': {
    meaning: { ru: 'Прямо сейчас, в процессе', uk: 'Просто зараз, у процесі' },
    uses: {
      ru: ['Действие идёт в момент речи: She is cooking now.', 'Временная ситуация в эти дни: I am studying for an exam this week.', 'Договорённость на ближайшее будущее: We are meeting friends tonight.'],
      uk: ['Дія триває в момент мовлення: She is cooking now.', 'Тимчасова ситуація цими днями: I am studying for an exam this week.', 'Домовленість на найближче майбутнє: We are meeting friends tonight.'],
    },
    form: [
      ['+', 'I am working', 'he / she is working · you / we / they are working'],
      ['−', 'I am not working', "he isn't working · they aren't working"],
      ['?', 'Am I working?', 'Is she working? · Are you working?'],
    ],
    markers: ['now', 'right now', 'at the moment', 'this week', 'today'],
    notes: {
      ru: ['-ing: write → writing (e уходит), swim → swimming (согласная удваивается), lie → lying.', 'Глаголы состояния (know, like, want, need) обычно не ставят в Continuous: I know (не I am knowing).'],
      uk: ['-ing: write → writing (e зникає), swim → swimming (приголосна подвоюється), lie → lying.', 'Дієслова стану (know, like, want, need) зазвичай не ставлять у Continuous: I know (не I am knowing).'],
    },
    examples: [
      ['I am listening to music right now.', 'Я сейчас слушаю музыку.', 'Я зараз слухаю музику.'],
      ["They aren't working at the moment.", 'Сейчас они не работают.', 'Зараз вони не працюють.'],
      ['Is Anna cooking dinner?', 'Анна готовит ужин?', 'Анна готує вечерю?'],
    ],
  },

  'past-simple': {
    meaning: { ru: 'В прошлом, и всё закончилось', uk: 'У минулому, і все закінчилося' },
    uses: {
      ru: ['Законченное действие в прошлом: I visited my grandparents last week.', 'Цепочка событий: He came home, ate and went to bed.', 'Привычка в прошлом: We played football every day as kids.'],
      uk: ['Завершена дія в минулому: I visited my grandparents last week.', 'Ланцюжок подій: He came home, ate and went to bed.', 'Звичка в минулому: We played football every day as kids.'],
    },
    form: [
      ['+', 'I / you / he / she / we / they worked', 'irregular: went, bought, ate…'],
      ['−', "I didn't work", "she didn't go"],
      ['?', 'Did you work?', 'Did she go?'],
    ],
    markers: ['yesterday', 'last week', 'two days ago', 'in 2020', 'last night'],
    notes: {
      ru: ['Форма одна для всех лиц: I worked, she worked.', 'Правильные: -ed (worked, studied, played). Неправильные — 2-я форма из справочника: go → went.', 'В отрицании и вопросе глагол в начальной форме: didn’t go (не didn’t went).'],
      uk: ['Форма одна для всіх осіб: I worked, she worked.', 'Правильні: -ed (worked, studied, played). Неправильні — 2-га форма з довідника: go → went.', 'У запереченні та питанні дієслово в початковій формі: didn’t go (не didn’t went).'],
    },
    examples: [
      ['We went to the cinema yesterday.', 'Вчера мы ходили в кино.', 'Учора ми ходили в кіно.'],
      ["She didn't buy bread last night.", 'Вчера вечером она не купила хлеб.', 'Учора ввечері вона не купила хліба.'],
      ['Did you study for the exam?', 'Ты готовился к экзамену?', 'Ти готувався до іспиту?'],
    ],
  },
}
