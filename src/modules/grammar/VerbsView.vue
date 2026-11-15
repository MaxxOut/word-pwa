<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { searchVerbs, verbsOf, FORMS } from './verbs.js'
import { useLibraryStore } from '@/core/library/store.js'
import { speak, canSpeak } from '@/shared/utils/browser.js'
import AppTopBar from '@/core/shell/AppTopBar.vue'
import UiInput from '@/shared/ui/UiInput.vue'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import UiEmpty from '@/shared/ui/UiEmpty.vue'
import UiSheet from '@/shared/ui/UiSheet.vue'
import VerbCard from './VerbCard.vue'

// справочник неправильных глаголов текущей библиотеки: поиск по любой форме или переводу,
// нажатие — карточка глагола, «i» — когда какая форма нужна.
// ?open=go — сразу карточка (переход из поиска «Слов»)
const route = useRoute()
const { t, locale } = useI18n()
const library = useLibraryStore()

const search = ref('')
const shown  = computed(() => searchVerbs(library.current?.id, search.value, locale.value))
const card   = ref(null)
const info   = ref(false)

const libraryId = computed(() => library.current?.id)
const langCode  = computed(() => library.current?.lang_code)

onMounted(() => {
  const verb = verbsOf(libraryId.value).find(v => v.base === route.query.open)
  if (verb) card.value?.open(verb)
})

function say(verb) {
  speak(verb.forms.join(', ').replace(/\//g, ', '), langCode.value)
}
</script>

<template>
  <AppTopBar :title="t('grammar.verbs')" :back="{ name: 'grammar' }">
    <UiIconButton icon="info" :label="t('grammar.howTo')" @click="info = true" />

    <template #below>
      <div class="tools">
        <UiInput
            v-model="search"
            icon="search"
            :placeholder="t('grammar.search')"
            clearable
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
        />
      </div>
    </template>
  </AppTopBar>

  <UiEmpty v-if="!shown.length" icon="search" :title="t('grammar.nothing')" />

  <ul v-else class="list">
    <li v-for="verb in shown" :key="verb.base" class="item">
      <button v-ripple type="button" class="item-main" @click="card.open(verb)">
        <span class="forms" :lang="langCode">
          <template v-for="(f, i) in verb.forms" :key="i">
            <span v-if="i" class="dash"> — </span><b>{{ f }}</b>
          </template>
        </span>
        <span class="muted small">{{ verb[locale] }}</span>
      </button>
      <UiIconButton v-if="canSpeak()" icon="speak" :label="t('grammar.speak')" @click="say(verb)" />
    </li>
  </ul>

  <VerbCard v-if="libraryId" ref="card" :library-id="libraryId" :lang-code="langCode" />

  <UiSheet v-model="info" :title="t('grammar.howTo')">
    <dl class="info">
      <template v-for="(name, i) in FORMS[libraryId]" :key="name">
        <dt>{{ i + 1 }}. {{ t(`grammar.forms.${name}`) }}</dt>
        <dd>{{ t(`grammar.info.${name}`) }}</dd>
      </template>
      <template v-if="libraryId === 'de'">
        <dt>{{ t('grammar.forms.praesens') }}</dt>
        <dd>{{ t('grammar.info.praesens') }}</dd>
      </template>
    </dl>
  </UiSheet>
</template>

<style scoped>
.tools { padding-bottom: 0.75rem; }

.list {
  display: grid;
  gap: 0.375rem;
  list-style: none;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-right: 0.5rem;
  border-radius: var(--radius-m);
  background: var(--container);
  box-shadow: var(--shadow-card);
}

.item-main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.125rem;
  padding: 0.75rem 0 0.75rem 1rem;
  border: 0;
  border-radius: var(--radius-m);
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.forms { font-size: 1.0625rem; }
.dash { color: var(--muted); }

.info {
  display: grid;
  gap: 0.25rem;
}
.info dt {
  margin-top: 0.5rem;
  font-weight: 700;
}
.info dt:first-child { margin-top: 0; }
</style>
