<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { wordsRepo } from '@/core/words/repo.js'
import { lookupReferences } from './reference.js'
import { missingForms, saveReferenceWordAsk } from './save.js'
import { toast } from '@/shared/ui/feedback.js'
import AppIcon from '@/shared/components/AppIcon.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import UiIconButton from '@/shared/ui/UiIconButton.vue'

// найденное в справочниках модулей — своим цветом: это не слова пользователя, статуса нет.
// Нажатие — карточка в модуле; кнопка — в словарь с формами (слово уже есть — с вопросом заменить).
// compact — в пузыре книги: одна строка, кнопка на всю ширину
const props = defineProps({
  libraryId: { type: String, default: null },
  text:      { type: String, required: true },
  exact:     { type: Boolean, default: false },
  compact:   { type: Boolean, default: false },
  // меняется — словарь правили в другом месте (удалили, добавили слово): перепроверить, что в нём есть
  stamp:     { type: Number, default: 0 },
})

const emit = defineEmits(['saved'])

const router        = useRouter()
const { t, locale } = useI18n()

const groups = computed(() => lookupReferences(props.libraryId, props.text, {
  locale: locale.value, exact: props.exact, limit: props.compact ? 1 : 5,
}))

const inDict = ref(new Map()) // key → слово словаря или null
const busy   = ref('')

// поиск меняется на каждую букву — ответ по старому тексту не перезапишет новый
let request = 0
watch([groups, () => props.stamp], async ([list]) => {
  const req = ++request
  const map = new Map()
  for (const item of list.flatMap(g => g.items)) {
    map.set(item.key, await wordsRepo.find(props.libraryId, item.word.word).catch(() => null))
  }
  if (req === request) inDict.value = map
}, { immediate: true })

// сколько форм не хватает; null — слова в словаре нет
function missing(item) {
  const word = inDict.value.get(item.key)
  return word ? missingForms(word, item.word).length : null
}

function openCard(item) {
  if (router.hasRoute(item.to.name)) router.push(item.to)
}

async function save(item) {
  busy.value = item.key
  try {
    const result = await saveReferenceWordAsk(props.libraryId, item.word, t)
    if (!result) return
    inDict.value = new Map(inDict.value).set(item.key, result.word)
    toast.success(t(result.created ? 'reference.added' : 'reference.replaced', { word: item.word.word }))
    emit('saved', result)
  } catch {
    toast.error(t('errors.save'))
  } finally {
    busy.value = ''
  }
}
</script>

<template>
  <section v-for="g in groups" :key="g.id" class="ref" :class="{ 'ref--compact': compact }">
    <div class="ref-head">
      <AppIcon name="info" size="1rem" />
      <span>{{ t(g.label) }}</span>
    </div>

    <div v-for="item in g.items" :key="item.key" class="ref-item">
      <button v-ripple type="button" class="ref-main" :title="t('reference.open')" @click="openCard(item)">
        <b class="ref-title" :lang="libraryId">{{ item.title }}</b>
        <span class="ref-sub">{{ item.subtitle }}</span>
      </button>

      <!-- compact: кнопка текстом на всю ширину -->
      <template v-if="compact">
        <UiButton
            v-if="missing(item) !== 0"
            class="ref-add"
            variant="filled"
            icon="add"
            block
            :loading="busy === item.key"
            @click="save(item)"
        >
          {{ missing(item) === null ? t('reference.addWithForms') : t('reference.replace') }}
        </UiButton>
        <span v-else class="ref-done"><AppIcon name="check" size="1.125rem" /> {{ t('reference.inDict') }}</span>
      </template>

      <template v-else>
        <span v-if="missing(item) === 0" class="ref-done" :title="t('reference.inDict')">
          <AppIcon name="check" size="1.25rem" />
          <span class="sr-only">{{ t('reference.inDict') }}</span>
        </span>
        <UiIconButton
            v-else
            icon="add"
            :label="missing(item) === null ? t('reference.add') : t('reference.replace')"
            :disabled="busy === item.key"
            @click="save(item)"
        />
      </template>
    </div>

    <div v-if="!compact" class="ref-hint small">{{ t('reference.hint') }}</div>
  </section>
</template>

<style scoped>
.ref {
  display: grid;
  gap: 0.375rem;
  padding: 0.75rem;
  border-radius: var(--radius-m);
  background: var(--tertiary-c);
  color: var(--on-tertiary-c);
}
.ref--compact {
  padding: 0.5rem 0.625rem;
  border-radius: 0.625rem;
}

.ref-head {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 700;
}

.ref-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.5rem;
}

.ref-main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.125rem;
  padding: 0.25rem 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.ref-title { font-size: 1rem; overflow-wrap: anywhere; }
.ref-sub { font-size: 0.875rem; opacity: 0.8; }

.ref-add { flex-basis: 100%; }

.ref-done {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.ref-hint { opacity: 0.75; }
</style>
