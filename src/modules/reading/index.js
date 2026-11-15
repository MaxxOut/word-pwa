// Чтение: тексты по темам (скачиваются по требованию), книга со страницами, слова из текста — в словарь
import readingIcon from '@material-symbols/svg-400/rounded/menu_book.svg?raw'
import readingFill from '@material-symbols/svg-400/rounded/menu_book-fill.svg?raw'
import castle from '@material-symbols/svg-400/rounded/castle.svg?raw'
import science from '@material-symbols/svg-400/rounded/science.svg?raw'
import coffee from '@material-symbols/svg-400/rounded/coffee.svg?raw'
import code from '@material-symbols/svg-400/rounded/code.svg?raw'
import toc from '@material-symbols/svg-400/rounded/toc.svg?raw'
import cloudOff from '@material-symbols/svg-400/rounded/cloud_off.svg?raw'
import cloudDownload from '@material-symbols/svg-400/rounded/cloud_download.svg?raw'
import refresh from '@material-symbols/svg-400/rounded/refresh.svg?raw'
import deleteSweep from '@material-symbols/svg-400/rounded/delete_sweep.svg?raw'
import ReadingView from './ReadingView.vue'
import TopicView from './TopicView.vue'
import ReaderView from './ReaderView.vue'
import ContinueReading from './ContinueReading.vue'

export default {
  routes: [
    { path: '/reading', name: 'reading', component: ReadingView },
    { path: '/reading/topic/:topic', name: 'reading-topic', component: TopicView, props: true },
    // книга — во весь экран, свайп листает страницы
    { path: '/reading/text/:id', name: 'reader', component: ReaderView, props: true, meta: { immersive: true } },
  ],
  nav:  [{ route: 'reading', icon: 'reading', label: 'reading.title', order: 20 }],
  home: [{ component: ContinueReading, order: 30 }],
  icons: {
    reading: readingIcon, 'reading-fill': readingFill,
    castle, science, coffee, code, toc,
    'cloud-off': cloudOff, 'cloud-download': cloudDownload, refresh, 'delete-sweep': deleteSweep,
  },
}
