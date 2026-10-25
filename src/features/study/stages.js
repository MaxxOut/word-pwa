// этапы тренировки — общие для изучения и повторения
import TranslationStage from './stages/TranslationStage.vue'
import ConstructorStage from './stages/ConstructorStage.vue'
import InputStage from './stages/InputStage.vue'

export const STAGES = [
  { key: 'direct',      component: TranslationStage, mode: 'direct',  title: 'stages.direct' },
  { key: 'reverse',     component: TranslationStage, mode: 'reverse', title: 'stages.reverse' },
  { key: 'constructor', component: ConstructorStage, mode: null,      title: 'stages.constructor' },
  { key: 'input',       component: InputStage,       mode: null,      title: 'stages.input' },
]

// включённые в настройках; keys — какие этапы вообще доступны в режиме
export function activeStages(settings, keys = STAGES.map(s => s.key)) {
  return STAGES.filter(s => keys.includes(s.key) && settings.stages?.[s.key] !== false)
}
