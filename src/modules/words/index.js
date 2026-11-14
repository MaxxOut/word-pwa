// Слова: список, карточка слова, импорт/экспорт CSV
import wordsIcon from '@material-symbols/svg-400/rounded/dictionary.svg?raw'
import wordsFill from '@material-symbols/svg-400/rounded/dictionary-fill.svg?raw'
import WordsView from './WordsView.vue'
import EmptyTile from './home/EmptyTile.vue'
import ProgressTile from './home/ProgressTile.vue'
import DataActions from './DataActions.vue'

export default {
  routes: [
    { path: '/words', name: 'words', component: WordsView },
  ],
  nav:         [{ route: 'words', icon: 'words', label: 'words.title', order: 10 }],
  home: [
    { component: EmptyTile,    order: 0 },
    { component: ProgressTile, order: 40 },
  ],
  dataActions: [{ component: DataActions, order: 10 }],
  icons:       { words: wordsIcon, 'words-fill': wordsFill },
}
