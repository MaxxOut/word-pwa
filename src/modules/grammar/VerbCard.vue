<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FORMS, verbAsWord } from './verbs.js'
import { wordsRepo } from '@/core/words/repo.js'
import { missingForms as missing, saveReferenceWordAsk } from '@/core/reference/save.js'
import { speak, canSpeak } from '@/shared/utils/browser.js'
import { toast } from '@/shared/ui/feedback.js'
import UiButton from '@/shared/ui/UiButton.vue'
import UiSheet from '@/shared/ui/UiSheet.vue'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import AppIcon from '@/shared/components/AppIcon.vue'

// карточка глагола: формы с транскрипцией и озвучкой, перевод, подвох, примеры на 2-ю и 3-ю форму.
// «Добавить в словарь» — обычное слово: учится перевод, формы (went, gone) — формами слова
const props = defineProps({
  libraryId: { type: String, required: true },
  langCode:  { type: String, required: true },
})

const { t, locale } = useI18n()

const verb   = ref(null)
const open   = ref(false)
const inDict = ref(null) // слово словаря или null
const busy   = ref(false)

defineExpose({
  async open(v) {
    verb.value   = v
    inDict.value = null
    open.value   = true
    inDict.value = await wordsRepo.find(props.libraryId, v.base).catch(() => null)
  },
})

const asWord = computed(() => verb.value && verbAsWord(verb.value, props.libraryId, locale.value))

// формы глагола, которых у слова в словаре ещё нет
const missingForms = computed(() => (inDict.value && asWord.value ? missing(inDict.value, asWord.value) : []))

// нет в словаре — добавить с формами; есть — с вопросом заменить данными справочника
async function save() {
  busy.value = true
  try {
    const result = await saveReferenceWordAsk(props.libraryId, asWord.value, t)
    if (!result) return
    inDict.value = result.word
    toast.success(t(result.created ? 'reference.added' : 'reference.replaced', { word: verb.value.base }))
  } catch {
    toast.error(t('errors.save'))
  } finally {
    busy.value = false
  }
}

const names = computed(() => FORMS[props.libraryId] ?? [])

// формы глагола в примере — жирным: «I <b>went</b> to the park»
function parts(text) {
  return text.split(/(\s+)/).map(w => ({
    w,
    on: verb.value.keys.includes(w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '').toLowerCase()),
  }))
}

function say(text) {
  speak(text.replace(/\//g, ', '), props.langCode)
}
</script>

<template>
  <UiSheet v-model="open" :title="verb?.base">
    <template v-if="verb">
      <div class="forms">
        <div v-for="(f, i) in verb.forms" :key="i" class="form">
          <span class="muted small">{{ t(`grammar.forms.${names[i]}`) }}</span>
          <b class="form-word" :lang="langCode">{{ f }}</b>
          <span v-if="verb.ipa" class="muted ipa">/{{ verb.ipa[i] }}/</span>
          <UiIconButton v-if="canSpeak()" class="form-speak" icon="speak" :label="t('grammar.speak')" @click="say(f)" />
        </div>
      </div>

      <p v-if="verb.present" class="present">
        <span class="muted">{{ t('grammar.forms.praesens') }}:</span> <b :lang="langCode">er {{ verb.present }}</b>
      </p>

      <p class="translation">{{ verb[locale] }}</p>

      <p v-if="verb.note" class="note">
        <AppIcon name="hint" size="1.25rem" />
        <span>{{ verb.note[locale] }}</span>
      </p>

      <div class="dict">
        <UiButton v-if="!inDict" block variant="filled" icon="add" :loading="busy" @click="save">
          {{ t('grammar.addToDict') }}
        </UiButton>
        <template v-else>
          <span class="in-dict"><AppIcon name="check" size="1.25rem" /> {{ t('reference.inDict') }}</span>
          <UiButton v-if="missingForms.length" variant="outlined" :loading="busy" @click="save">
            {{ t('reference.replace') }}
          </UiButton>
        </template>
      </div>

      <div class="examples">
        <div v-for="e in verb.examples" :key="e.form" class="example">
          <span class="muted small">{{ t(`grammar.forms.${names[e.form]}`) }}</span>
          <div :lang="langCode">
            <template v-for="(p, i) in parts(e.text)" :key="i"><b v-if="p.on">{{ p.w }}</b><template v-else>{{ p.w }}</template></template>
          </div>
          <div class="muted">{{ e[locale] }}</div>
        </div>
      </div>
    </template>
  </UiSheet>
</template>

<style scoped>
.forms {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.form {
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 0.125rem;
  min-width: 0;
  padding: 0.625rem 0.25rem 0.25rem;
  border-radius: var(--radius-m);
  background: var(--container-hi);
  text-align: center;
}
.form-word {
  font-size: 1.125rem;
  overflow-wrap: anywhere;
}
.ipa { font-size: 0.9375rem; }

.present { margin-top: 0.75rem; }

.translation {
  margin-top: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.note {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-m);
  background: var(--primary-c);
  color: var(--on-primary-c);
}

.dict {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 1rem;
}
.in-dict {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--success);
  font-weight: 600;
}

.examples {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}
.example {
  display: grid;
  gap: 0.125rem;
}
</style>
