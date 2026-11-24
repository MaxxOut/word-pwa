// этапы тренировки — общие для изучения и повторения
import TranslationStage from './stages/TranslationStage.vue'
import ConstructorStage from './stages/ConstructorStage.vue'
import InputStage from './stages/InputStage.vue'
import IntroStage from './stages/IntroStage.vue'
import ContextStage from './stages/ContextStage.vue'
import { canSpeak } from '@/shared/utils/browser.js'
import { contextOf } from './domain.js'

// pick — какие слова занятия идут в этап (нет ни одного — этап пропускается),
// available — можно ли этап вообще (озвучка есть не везде)
export const STAGES = [
  { key: 'intro',       component: IntroStage,       mode: null,      title: 'study.stages.intro' },
  { key: 'direct',      component: TranslationStage, mode: 'direct',  title: 'study.stages.direct' },
  { key: 'reverse',     component: TranslationStage, mode: 'reverse', title: 'study.stages.reverse' },
  { key: 'constructor', component: ConstructorStage, mode: null,      title: 'study.stages.constructor' },
  { key: 'context',     component: ContextStage,     mode: null,      title: 'study.stages.context',
    pick: words => words.filter(w => contextOf(w)) },
  { key: 'input',       component: InputStage,       mode: null,      title: 'study.stages.input' },
  { key: 'listen',      component: InputStage,       mode: 'listen',  title: 'study.stages.listen',
    available: canSpeak },
]

// в повторении — только переводы
export const REPEAT_STAGES = STAGES.filter(s => s.key === 'direct' || s.key === 'reverse')

// включённые в настройках; enabled — { key: bool } (settings.stages или settings.repeat_stages)
export function activeStages(enabled, list = STAGES) {
  return list.filter(s => enabled?.[s.key] !== false && (s.available?.() ?? true))
}

// слова этапа
export const stageWords = (stage, words) => stage.pick?.(words) ?? words
