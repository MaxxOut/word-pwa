// этапы тренировки — общие для изучения и повторения
import TranslationStage from './stages/TranslationStage.vue'
import ConstructorStage from './stages/ConstructorStage.vue'
import InputStage from './stages/InputStage.vue'
import IntroStage from './stages/IntroStage.vue'
import { canSpeak } from '@/shared/utils/browser.js'

// available — можно ли этап вообще (озвучка есть не везде)
export const STAGES = [
  { key: 'intro',       component: IntroStage,       mode: null,      title: 'study.stages.intro' },
  { key: 'direct',      component: TranslationStage, mode: 'direct',  title: 'study.stages.direct' },
  { key: 'reverse',     component: TranslationStage, mode: 'reverse', title: 'study.stages.reverse' },
  { key: 'constructor', component: ConstructorStage, mode: null,      title: 'study.stages.constructor' },
  { key: 'listen',      component: InputStage,       mode: 'listen',  title: 'study.stages.listen',
    available: canSpeak },
  { key: 'input',       component: InputStage,       mode: null,      title: 'study.stages.input' },
]

// в повторении — только переводы
export const REPEAT_STAGES = STAGES.filter(s => s.key === 'direct' || s.key === 'reverse')

// включённые в настройках; enabled — { key: bool } (settings.stages или settings.repeat_stages)
export function activeStages(enabled, list = STAGES) {
  return list.filter(s => enabled?.[s.key] !== false && (s.available?.() ?? true))
}
