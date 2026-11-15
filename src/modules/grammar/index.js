// Грамматика: справочник неправильных глаголов; потом — правила с теорией и практикой
import grammarIcon from '@material-symbols/svg-400/rounded/spellcheck.svg?raw'
import grammarFill from '@material-symbols/svg-400/rounded/spellcheck-fill.svg?raw'
import verbs from '@material-symbols/svg-400/rounded/history.svg?raw'
import rule from '@material-symbols/svg-400/rounded/rule.svg?raw'
import tenses from '@material-symbols/svg-400/rounded/schedule.svg?raw'
import train from '@material-symbols/svg-400/rounded/exercise.svg?raw'
import GrammarView from './GrammarView.vue'
import VerbsView from './VerbsView.vue'
import TensesView from './TensesView.vue'
import TenseView from './TenseView.vue'
import TrainView from './TrainView.vue'
import GrammarTile from './GrammarTile.vue'
import GrammarSettings from './GrammarSettings.vue'
import { verbReferences } from './verbs.js'
import { grammarRepo } from './repo.js'

export default {
  routes: [
    { path: '/grammar', name: 'grammar', component: GrammarView },
    { path: '/grammar/verbs', name: 'grammar-verbs', component: VerbsView },
    { path: '/grammar/tenses', name: 'grammar-tenses', component: TensesView },
    { path: '/grammar/tenses/:id', name: 'grammar-tense', component: TenseView, props: true },
    // тренировка — во весь экран, без нижнего меню
    { path: '/grammar/tenses/:id/train', name: 'grammar-train', component: TrainView, props: true, meta: { immersive: true } },
  ],
  nav:          [{ route: 'grammar', icon: 'grammar', label: 'grammar.title', order: 30 }],
  home:         [{ component: GrammarTile, order: 35 }],
  // этаж «грамматика» в «Активности» на главной
  activity:     [{ id: 'grammar', label: 'grammar.activity', color: 'teal', days: id => grammarRepo.days(id) }],
  settingsTabs: [{ id: 'grammar', icon: 'grammar', label: 'grammar.title', order: 20 }],
  settings:     [{ tab: 'grammar', component: GrammarSettings, order: 10 }],
  // поиск по справочнику в «Словах», книге и карточке слова — через ядро
  references:   [{ id: 'verbs', label: 'grammar.verbs', search: verbReferences }],
  icons:        { grammar: grammarIcon, 'grammar-fill': grammarFill, verbs, rule, tenses, train },
}
