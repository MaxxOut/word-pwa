// Изучение и повторение: занятия по этапам, плитки «Учить» / «Повторить» и активность
import studyIcon from '@material-symbols/svg-400/rounded/school.svg?raw'
import studyFill from '@material-symbols/svg-400/rounded/school-fill.svg?raw'
import repeatIcon from '@material-symbols/svg-400/rounded/replay.svg?raw'
import StudyView from './StudyView.vue'
import RepeatView from './RepeatView.vue'
import LearnTile from './home/LearnTile.vue'
import RepeatTile from './home/RepeatTile.vue'
import ActivityTile from './home/ActivityTile.vue'
import LearningSettings from './LearningSettings.vue'
import RepeatSettings from './RepeatSettings.vue'

export default {
  // занятия — во весь экран, без нижнего меню
  routes: [
    { path: '/study',  name: 'study',  component: StudyView,  meta: { immersive: true } },
    { path: '/repeat', name: 'repeat', component: RepeatView, meta: { immersive: true } },
  ],
  home: [
    { component: LearnTile,    order: 10 },
    { component: RepeatTile,   order: 20 },
    { component: ActivityTile, order: 50 },
  ],
  settingsTabs: [{ id: 'study', icon: 'study', label: 'study.settings.tab', order: 10 }],
  settings: [
    { tab: 'study', component: LearningSettings, order: 10 },
    { tab: 'study', component: RepeatSettings,   order: 20 },
  ],
  icons: { study: studyIcon, 'study-fill': studyFill, repeat: repeatIcon },
}
