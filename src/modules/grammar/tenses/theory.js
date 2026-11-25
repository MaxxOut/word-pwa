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

  'future-simple': {
    meaning: { ru: 'В будущем: решение, обещание, прогноз', uk: 'У майбутньому: рішення, обіцянка, прогноз' },
    uses: {
      ru: ['Решение в момент речи: I’m tired — I will take a taxi.', 'Обещание, предложение: I will help you tomorrow.', 'Прогноз, мнение о будущем: It will rain next week.'],
      uk: ['Рішення в момент мовлення: I’m tired — I will take a taxi.', 'Обіцянка, пропозиція: I will help you tomorrow.', 'Прогноз, думка про майбутнє: It will rain next week.'],
    },
    form: [
      ['+', 'I / you / he / she / we / they will work', "short: I'll, she'll"],
      ['−', "I won't work", "she won't go"],
      ['?', 'Will you work?', 'Will she go?'],
    ],
    markers: ['tomorrow', 'next week', 'next year', 'soon', 'in two days'],
    notes: {
      ru: ['will одно для всех лиц, глагол — в начальной форме: she will go (не will goes).', 'won’t = will not.', 'Договорённость на конкретное время — чаще Present Continuous: We are meeting friends tonight.'],
      uk: ['will одне для всіх осіб, дієслово — у початковій формі: she will go (не will goes).', 'won’t = will not.', 'Домовленість на конкретний час — частіше Present Continuous: We are meeting friends tonight.'],
    },
    examples: [
      ['I will call you tomorrow.', 'Я позвоню тебе завтра.', 'Я подзвоню тобі завтра.'],
      ["They won't visit the museum next week.", 'На следующей неделе они не пойдут в музей.', 'Наступного тижня вони не підуть до музею.'],
      ['Will Anna cook dinner?', 'Анна приготовит ужин?', 'Анна приготує вечерю?'],
    ],
  },

  'past-continuous': {
    meaning: { ru: 'Шло в определённый момент в прошлом', uk: 'Тривало в певний момент у минулому' },
    uses: {
      ru: ['Действие шло в момент в прошлом: At 8 pm yesterday I was cooking dinner.', 'Длинное действие прервали коротким: I was reading when the phone rang.', 'Два действия шли одновременно: She was cooking while he was cleaning.'],
      uk: ['Дія тривала в момент у минулому: At 8 pm yesterday I was cooking dinner.', 'Довгу дію перервала коротка: I was reading when the phone rang.', 'Дві дії тривали одночасно: She was cooking while he was cleaning.'],
    },
    form: [
      ['+', 'I / he / she was working', 'you / we / they were working'],
      ['−', "I wasn't working", "they weren't working"],
      ['?', 'Was she working?', 'Were you working?'],
    ],
    markers: ['at 8 pm yesterday', 'at that moment', 'at this time yesterday', 'when…', 'while…'],
    notes: {
      ru: ['was — для I / he / she / it, were — для you / we / they.', 'Прервавшее действие — в Past Simple: I was sleeping when you called.', 'Глаголы состояния (know, like, want) в Continuous не ставят.'],
      uk: ['was — для I / he / she / it, were — для you / we / they.', 'Дія, що перервала, — у Past Simple: I was sleeping when you called.', 'Дієслова стану (know, like, want) у Continuous не ставлять.'],
    },
    examples: [
      ['I was watching TV at 8 pm yesterday.', 'Вчера в 8 вечера я смотрел телевизор.', 'Учора о 8 вечора я дивився телевізор.'],
      ["We weren't sleeping when the phone rang.", 'Мы не спали, когда зазвонил телефон.', 'Ми не спали, коли задзвонив телефон.'],
      ['Were they playing football at that moment?', 'Они играли в футбол в тот момент?', 'Вони грали у футбол у той момент?'],
    ],
  },

  'present-perfect': {
    meaning: { ru: 'Уже сделано, важен результат сейчас', uk: 'Уже зроблено, важливий результат зараз' },
    uses: {
      ru: ['Результат важен сейчас: I have lost my keys (и сейчас их нет).', 'Опыт за жизнь, без точного времени: She has visited London twice.', 'Период ещё не закончился: I have drunk three coffees today.'],
      uk: ['Результат важливий зараз: I have lost my keys (і зараз їх немає).', 'Досвід за життя, без точного часу: She has visited London twice.', 'Період ще не закінчився: I have drunk three coffees today.'],
    },
    form: [
      ['+', 'I / you / we / they have worked', 'he / she / it has worked'],
      ['−', "I haven't worked", "she hasn't gone"],
      ['?', 'Have you worked?', 'Has she gone?'],
    ],
    markers: ['already', 'just', 'yet', 'ever', 'never', 'recently', 'this week', 'today'],
    notes: {
      ru: ['Глагол — 3-я форма: правильные на -ed (worked), неправильные — из справочника (go → gone, eat → eaten).', 'Точное время в прошлом (yesterday, last week, in 2020) — только Past Simple: I saw him yesterday (не have seen).', 'has — для he / she / it, have — для остальных.'],
      uk: ['Дієслово — 3-тя форма: правильні на -ed (worked), неправильні — з довідника (go → gone, eat → eaten).', 'Точний час у минулому (yesterday, last week, in 2020) — тільки Past Simple: I saw him yesterday (не have seen).', 'has — для he / she / it, have — для решти.'],
    },
    examples: [
      ['I have read this book.', 'Я прочитал эту книгу.', 'Я прочитав цю книгу.'],
      ["Tom hasn't eaten breakfast today.", 'Том сегодня не завтракал.', 'Том сьогодні не снідав.'],
      ['Have you ever swum in the sea?', 'Ты когда-нибудь плавал в море?', 'Ти колись плавав у морі?'],
    ],
  },

  'future-continuous': {
    meaning: { ru: 'Будет идти в определённый момент в будущем', uk: 'Триватиме в певний момент у майбутньому' },
    uses: {
      ru: ['Действие будет идти в момент в будущем: At 8 pm tomorrow I will be working.', 'Обычный ход событий, без особого намерения: I will be passing the shop anyway.', 'Вежливый вопрос о планах: Will you be using the car tonight?'],
      uk: ['Дія триватиме в момент у майбутньому: At 8 pm tomorrow I will be working.', 'Звичайний перебіг подій, без особливого наміру: I will be passing the shop anyway.', 'Ввічливе питання про плани: Will you be using the car tonight?'],
    },
    form: [
      ['+', 'I / you / he / she / we / they will be working', "short: I'll be working"],
      ['−', "I won't be working", "she won't be going"],
      ['?', 'Will you be working?', 'Will she be going?'],
    ],
    markers: ['at 8 pm tomorrow', 'at this time tomorrow', 'this time next week', 'all day tomorrow', 'when you arrive'],
    notes: {
      ru: ['will be + -ing — одно для всех лиц: she will be working (не will be works).', 'После when / if / before — настоящее время: When you arrive, I will be waiting.', 'Глаголы состояния (know, like, want) в Continuous не ставят: I will know (не will be knowing).'],
      uk: ['will be + -ing — одне для всіх осіб: she will be working (не will be works).', 'Після when / if / before — теперішній час: When you arrive, I will be waiting.', 'Дієслова стану (know, like, want) у Continuous не ставлять: I will know (не will be knowing).'],
    },
    examples: [
      ['At this time tomorrow I will be flying to Rome.', 'Завтра в это время я буду лететь в Рим.', 'Завтра в цей час я летітиму до Рима.'],
      ["We won't be watching TV at 8 pm — we'll be at the gym.", 'В 8 вечера мы не будем смотреть телевизор — мы будем в спортзале.', 'О 8 вечора ми не дивитимемося телевізор — ми будемо в спортзалі.'],
      ['Will you be working all day tomorrow?', 'Ты будешь работать завтра весь день?', 'Ти працюватимеш завтра весь день?'],
    ],
  },

  'past-perfect': {
    meaning: { ru: 'Случилось раньше другого момента в прошлом', uk: 'Сталося раніше за інший момент у минулому' },
    uses: {
      ru: ['Закончилось до другого действия в прошлом: When we arrived, the film had started.', 'Результат к моменту в прошлом: By 6 pm she had finished the report.', 'Причина того, что было в прошлом: He was tired because he had worked all day.'],
      uk: ['Закінчилося до іншої дії в минулому: When we arrived, the film had started.', 'Результат на момент у минулому: By 6 pm she had finished the report.', 'Причина того, що було в минулому: He was tired because he had worked all day.'],
    },
    form: [
      ['+', 'I / you / he / she / we / they had worked', 'irregular: had gone, had eaten…'],
      ['−', "I hadn't worked", "she hadn't gone"],
      ['?', 'Had you worked?', 'Had she gone?'],
    ],
    markers: ['before', 'by the time', 'already', 'just', 'never … before', 'after'],
    notes: {
      ru: ['had — одно для всех лиц, глагол — 3-я форма: she had gone (не had went).', 'Нужен момент в прошлом, до которого всё случилось: When I came, he had left. Нет его — Past Simple.', 'С before / after порядок и так понятен — подойдёт и Past Simple: After he left, I called.'],
      uk: ['had — одне для всіх осіб, дієслово — 3-тя форма: she had gone (не had went).', 'Потрібен момент у минулому, до якого все сталося: When I came, he had left. Немає його — Past Simple.', 'З before / after порядок і так зрозумілий — підійде й Past Simple: After he left, I called.'],
    },
    examples: [
      ['When we got to the cinema, the film had already started.', 'Когда мы пришли в кино, фильм уже начался.', 'Коли ми прийшли в кіно, фільм уже почався.'],
      ["She hadn't eaten anything before the exam.", 'Перед экзаменом она ничего не ела.', 'Перед іспитом вона нічого не їла.'],
      ['Had you met Tom before the party?', 'Ты был знаком с Томом до вечеринки?', 'Ти був знайомий з Томом до вечірки?'],
    ],
  },
}
