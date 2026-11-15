// Грамматика: справочник неправильных глаголов; потом — правила с теорией и практикой
import grammarIcon from '@material-symbols/svg-400/rounded/spellcheck.svg?raw'
import grammarFill from '@material-symbols/svg-400/rounded/spellcheck-fill.svg?raw'
import verbs from '@material-symbols/svg-400/rounded/history.svg?raw'
import rule from '@material-symbols/svg-400/rounded/rule.svg?raw'
import GrammarView from './GrammarView.vue'
import VerbsView from './VerbsView.vue'
import GrammarSettings from './GrammarSettings.vue'
import { verbReferences } from './verbs.js'

export default {
  routes: [
    { path: '/grammar', name: 'grammar', component: GrammarView },
    { path: '/grammar/verbs', name: 'grammar-verbs', component: VerbsView },
  ],
  nav:          [{ route: 'grammar', icon: 'grammar', label: 'grammar.title', order: 30 }],
  settingsTabs: [{ id: 'grammar', icon: 'grammar', label: 'grammar.title', order: 20 }],
  settings:     [{ tab: 'grammar', component: GrammarSettings, order: 10 }],
  // поиск по справочнику в «Словах», книге и карточке слова — через ядро
  references:   [{ id: 'verbs', label: 'grammar.verbs', search: verbReferences }],
  icons:        { grammar: grammarIcon, 'grammar-fill': grammarFill, verbs, rule },
}
