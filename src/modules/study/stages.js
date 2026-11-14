// этапы тренировки — общие для изучения и повторения
import TranslationStage from './stages/TranslationStage.vue'
import ConstructorStage from './stages/ConstructorStage.vue'
import InputStage from './stages/InputStage.vue'

export const STAGES = [
  { key: 'direct',      component: TranslationStage, mode: 'direct',  title: 'study.stages.direct' },
  { key: 'reverse',     component: TranslationStage, mode: 'reverse', title: 'study.stages.reverse' },
  { key: 'constructor', component: ConstructorStage, mode: null,      title: 'study.stages.constructor' },
  { key: 'input',       component: InputStage,       mode: null,      title: 'study.stages.input' },
]

// в повторении — только переводы
export const REPEAT_STAGES = STAGES.filter(s => s.key === 'direct' || s.key === 'reverse')

// включённые в настройках; enabled — { key: bool } (settings.stages или settings.repeat_stages)
export function activeStages(enabled, list = STAGES) {
  return list.filter(s => enabled?.[s.key] !== false)
}
