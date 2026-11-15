<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { wordsRepo } from '@/core/words/repo.js'
import { DuplicateWordError, FormsLimitError } from '@/core/words/errors.js'
import { cleanToken, exampleAround, baseCandidates } from './domain.js'
import { useLibraryStore } from '@/core/library/store.js'
import TranslateActions from '@/core/translate/TranslateActions.vue'
import ReferenceHits from '@/core/reference/ReferenceHits.vue'
import { toast } from '@/shared/ui/feedback.js'
import { speak, canSpeak } from '@/shared/utils/browser.js'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import { pushLayer, popLayer } from '@/shared/ui/backClose.js'
import AppIcon from '@/shared/components/AppIcon.vue'
import UiButton from '@/shared/ui/UiButton.vue'

// пузырь у нажатого слова: известное — слово и перевод (нет перевода — можно перевести);
// записано формой другого слова — dogs → dog и перевод; новое — перевести и добавить в словарь
// или присоединить формой к слову из словаря (варианты по окончаниям — только подсказка).
// Нажатое есть в справочнике (went → go — went — gone) — сверху блок «в словарь с формами».
// Рядом со словом — озвучка. Под словом, а если снизу не влезает — над ним. Закрывается нажатием мимо и «Назад».
const props = defineProps({
  libraryId: { type: String, required: true },
})

// closed — книга досчитает страницы, отложенные, пока была клавиатура
const emit = defineEmits(['closed'])

const { t }   = useI18n()
const library = useLibraryStore()

const MARGIN = 8 // px от краёв экрана и от слова

const visible = ref(false)
const found   = ref(null)  // слово из словаря
const word    = ref('')    // новое слово — можно поправить форму
const translation = ref('') // через запятую — несколько переводов
const example = ref('')
const withExample = ref(true)
const error   = ref('')
const aiRow   = ref(null) // ответ ИИ с другим словом (начальная форма) — ждёт подтверждения
const saving  = ref(false)
const opened  = ref(0)    // номер открытия: блок перевода пересоздаётся — старый ответ не попадёт к новому слову
const viaForm = ref(null) // нажатое записано формой: { word, form }
const clicked = ref('')   // нажатое слово как в тексте (без знаков)
const suggestions = ref([]) // слова словаря, формой которых может быть нажатое (не больше 3)

const MAX_SUGGESTIONS = 3

// слово, для которого промпт уже скопирован: пузырь могли закрыть, пока ходили в чат с ИИ —
// при новом нажатии на него сразу поле ответа, промпт не копируется заново (не затрёт ответ в буфере)
const waitingFor = ref('')
const isWaiting  = () => waitingFor.value === clicked.value.toLowerCase()

const bubble = ref(null)
const pos    = ref({ top: 0, left: 0, arrow: 0, above: false })

let anchor  = null // span слова
let request = 0    // номер нажатия: ответ по старому слову не перезапишет более позднее

// el — span слова, tokens — слова абзаца, k — номер нажатого
async function open(el, tokens, k) {
  const text = cleanToken(tokens[k])
  if (!text) return
  const req   = ++request
  const known = await wordsRepo.find(props.libraryId, text)
  const form  = known ? null : await wordsRepo.findByForm(props.libraryId, text)
  const maybe = known || form ? [] : await suggest(text)
  if (req !== request) return

  opened.value++
  found.value       = known
  viaForm.value     = form
  clicked.value     = text
  suggestions.value = maybe
  translation.value = ''
  aiRow.value       = null
  // предложение — пример для словаря и подсказка ИИ, какое значение нужно
  example.value     = exampleAround(tokens, k)
  withExample.value = true
  // в английском заглавная — обычно начало предложения; в немецком — ещё и существительное
  if (!known && !form) word.value = props.libraryId === 'de' ? text : text.toLowerCase()
  error.value = ''

  anchor?.classList.remove('w--on')
  anchor = el
  anchor.classList.add('w--on')

  if (!visible.value) {
    visible.value = true
    // перевод и поле ответа ИИ меняют высоту — пузырь переставляется
    nextTick(() => resizer.observe(bubble.value))
    pushLayer(closeFromBack)
    document.addEventListener('pointerdown', onOutside, true)
  }
  await nextTick()
  place()
}

function place() {
  const r  = anchor.getBoundingClientRect()
  const b  = bubble.value.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const above = r.bottom + MARGIN + b.height > vh - MARGIN
  const top   = above ? r.top - MARGIN - b.height : r.bottom + MARGIN
  const mid   = r.left + r.width / 2
  const left  = Math.min(Math.max(mid - b.width / 2, MARGIN), vw - b.width - MARGIN)
  pos.value = { top: Math.max(top, MARGIN), left, arrow: mid - left, above }
}

const resizer = new ResizeObserver(() => anchor && bubble.value && place())

function hide() {
  if (!visible.value) return
  visible.value = false
  resizer.disconnect()
  anchor?.classList.remove('w--on')
  anchor = null
  document.removeEventListener('pointerdown', onOutside, true)
  emit('closed')
}

function close() {
  if (!visible.value) return
  hide()
  popLayer(closeFromBack)
}

// «Назад» — запись истории уже снята
function closeFromBack() {
  hide()
}

// мимо пузыря — закрыть; по другому слову — не закрываем, пузырь переедет к нему
function onOutside(e) {
  if (bubble.value?.contains(e.target)) return
  if (e.target.closest?.('.w')) return
  close()
}

async function add() {
  const text = word.value.trim()
  if (!text) return
  await save(() => wordsRepo.create(props.libraryId, {
    word:        text,
    translation: splitTranslation(translation.value),
    examples:    bookExample(),
  }), true)
}

const splitTranslation = value => value.split(',').map(s => s.trim()).filter(Boolean)
const bookExample      = () => (withExample.value && example.value ? [example.value] : [])

// известное слово без перевода — сохранить перевод
async function saveTranslation() {
  const list = splitTranslation(translation.value)
  if (!list.length) return
  await save(() => wordsRepo.update(found.value.id, { translation: list }), false)
}

// ответ ИИ: новое слово — сразу в словарь (в первом поле может быть начальная форма: peeped → peep);
// известное — дополнить перевод, транскрипцию и примеры
async function fromAi(row) {
  if (found.value) {
    const w = found.value
    // ответ про другое слово — не дописывать молча, показать и спросить
    if (row.word.trim().toLowerCase() !== w.word.toLowerCase()) {
      aiRow.value = row
      return
    }
    await save(() => wordsRepo.update(w.id, {
      translation:   row.translation,
      transcription: w.transcription || row.transcription,
      examples:      [...new Set([...(w.examples ?? []), ...row.examples])],
    }), false)
    return
  }
  // ИИ вернул другое слово (peeped → peep) — данные только для него: показать и спросить
  if (row.word.trim().toLowerCase() !== word.value.trim().toLowerCase()) {
    aiRow.value = row
    return
  }
  await addAiRow(row)
}

// ИИ вернул начальную форму: её — в словарь (или она уже там), нажатое — её формой
// (нажатое уже отдельное слово без перевода — форму не делаем, начальная форма — просто новое слово)
async function addAiRow(row) {
  const formWord = word.value.trim() || clicked.value
  const base     = found.value ? null : await wordsRepo.find(props.libraryId, row.word)
  if (base) return attachTo(base)
  return save(() => wordsRepo.create(props.libraryId, {
    word:          row.word,
    translation:   row.translation,
    transcription: row.transcription,
    examples:      [...new Set([...bookExample(), ...row.examples])],
    forms:         found.value ? [] : [{ word: formWord }],
  }), true)
}

// слова словаря, формой которых может быть нажатое: кандидаты по окончаниям, что есть в словаре
async function suggest(text) {
  const out = []
  for (const c of baseCandidates(text, props.libraryId)) {
    const w = await wordsRepo.find(props.libraryId, c)
    if (w && !out.some(x => x.id === w.id)) out.push(w)
    if (out.length === MAX_SUGGESTIONS) break
  }
  return out
}

// присоединить нажатое формой к слову словаря
async function attachTo(target) {
  const formWord = word.value.trim() || clicked.value
  saving.value = true
  error.value  = ''
  try {
    await wordsRepo.addForm(target.id, { word: formWord })
    close()
    waitingFor.value = ''
    toast.success(t('reading.formAdded', { form: formWord, word: target.word }))
  } catch (err) {
    if (err instanceof FormsLimitError) error.value = t('word.formsLimit')
    else toast.error(t('errors.save'))
  } finally {
    saving.value = false
  }
}


// добавлено из справочника — пузырь сделал своё
function onReferenceSaved({ created }) {
  close()
  waitingFor.value = ''
  if (created) library.load()
}

async function save(action, created) {
  saving.value = true
  error.value  = ''
  try {
    await action()
    close()
    waitingFor.value = ''
    toast.success(t(created ? 'word.created' : 'word.updated'))
    if (created) library.load()
  } catch (err) {
    if (err instanceof DuplicateWordError) error.value = t('word.duplicate')
    else toast.error(t('errors.save'))
  } finally {
    saving.value = false
  }
}

onBeforeUnmount(() => {
  close()
  resizer.disconnect()
})

// озвучить: известное — как в словаре, новое — как в поле (могли поправить форму)
function say(text) {
  speak(text, library.current?.lang_code ?? props.libraryId)
}

defineExpose({ open, close })
</script>

<template>
  <Teleport to="body">
    <Transition name="bubble">
      <div
          v-if="visible"
          ref="bubble"
          class="bubble"
          :class="{ 'bubble--above': pos.above }"
          :style="{ top: `${pos.top}px`, left: `${pos.left}px`, '--arrow': `${pos.arrow}px` }"
          role="dialog"
      >
        <!-- записано формой другого слова: dogs → dog -->
        <template v-if="viaForm">
          <div class="head">
            <div class="word grow">{{ viaForm.form.word }} <span class="muted">→</span> {{ viaForm.word.word }}</div>
            <UiIconButton v-if="canSpeak()" class="say" icon="speak" :label="t('reading.speak')" @click="say(viaForm.form.word)" />
          </div>
          <div v-if="viaForm.form.translation.length || viaForm.form.note" class="muted small">
            {{ [viaForm.form.translation.join(', '), viaForm.form.note].filter(Boolean).join(' · ') }}
          </div>
          <div class="translation">{{ viaForm.word.translation?.join(', ') || t('status.untranslated') }}</div>
        </template>

        <!-- известное слово -->
        <template v-else-if="found && found.translation?.length">
          <div class="head">
            <b class="word grow">{{ found.word }}</b>
            <UiIconButton v-if="canSpeak()" class="say" icon="speak" :label="t('reading.speak')" @click="say(found.word)" />
          </div>
          <div class="translation">{{ found.translation.join(', ') }}</div>
        </template>

        <!-- известное без перевода — перевести и сохранить -->
        <form v-else-if="found" class="add" @submit.prevent="saveTranslation">
          <div class="head">
            <b class="word grow">{{ found.word }}</b>
            <UiIconButton v-if="canSpeak()" class="say" icon="speak" :label="t('reading.speak')" @click="say(found.word)" />
          </div>
          <div class="muted translation translation--none">{{ t('status.untranslated') }}</div>
          <div class="part">
            <input
                v-model="translation"
                class="tr-input"
                :placeholder="t('word.translation')"
                :aria-label="t('word.translation')"
                autocomplete="off"
            >
            <TranslateActions :key="opened" :waiting="isWaiting()" :word="found.word" :from="libraryId" :context="example" @online="translation = $event" @ai="fromAi" @copied="waitingFor = clicked.toLowerCase()" />
            <div v-if="error" class="error small">{{ error }}</div>
          </div>
          <!-- ответ ИИ про другое слово — сохранить его новым словом или отменить -->
          <div v-if="aiRow" class="choose">
            <div class="muted small">{{ t('reading.aiBaseForm') }}</div>
            <div><b>{{ aiRow.word }}</b> — {{ aiRow.translation.join(', ') }}</div>
            <div class="choose-buttons">
              <UiButton variant="text" @click="aiRow = null">{{ t('reading.cancel') }}</UiButton>
              <UiButton variant="filled" :loading="saving" @click="addAiRow(aiRow)">{{ t('common.save') }}</UiButton>
            </div>
          </div>
          <UiButton v-else variant="filled" type="submit" :loading="saving" :disabled="!translation.trim()" block>
            {{ t('common.save') }}
          </UiButton>
        </form>

        <!-- новое — перевести и добавить -->
        <form v-else class="add" @submit.prevent="add">
          <div class="head">
            <input
                v-model="word"
                class="word word-input"
                :aria-label="t('word.word')"
                :title="t('reading.formHint')"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
            >
            <UiIconButton v-if="canSpeak()" class="say" icon="speak" :label="t('reading.speak')" :disabled="!word.trim()" @click="say(word)" />
          </div>
          <div class="muted translation translation--none">{{ t('status.untranslated') }}</div>

          <ReferenceHits :library-id="libraryId" :text="clicked" exact compact @saved="onReferenceSaved" />

          <!-- может быть формой слова из словаря: присоединяет только пользователь -->
          <div v-if="suggestions.length" class="part">
            <div class="muted small">{{ t('reading.maybe') }}</div>
            <div v-for="s in suggestions" :key="s.id" class="maybe-row">
              <span class="grow"><b>{{ s.word }}</b> — {{ s.translation?.join(', ') || t('status.untranslated') }}</span>
              <UiButton class="small-btn" variant="tonal" icon="add" :disabled="saving" @click="attachTo(s)">
                {{ t('reading.asForm') }}
              </UiButton>
            </div>
          </div>

          <label v-if="example" class="example">
            <input v-model="withExample" type="checkbox" class="sr-only">
            <span class="box" :class="{ 'box--on': withExample }">
              <AppIcon v-if="withExample" name="check" size="1rem" />
            </span>
            <span class="muted small">{{ t('reading.addExample') }}</span>
            <span class="example-text">{{ example }}</span>
          </label>

          <!-- перевод — у кнопки -->
          <div class="part">
            <input
                v-model="translation"
                class="tr-input"
                :placeholder="t('word.translation')"
                :aria-label="t('word.translation')"
                autocomplete="off"
            >
            <TranslateActions :key="opened" :waiting="isWaiting()" :word="word" :from="libraryId" :context="example" @online="translation = $event" @ai="fromAi" @copied="waitingFor = clicked.toLowerCase()" />
            <div v-if="error" class="error small">{{ error }}</div>
          </div>

          <!-- ИИ вернул начальную форму — сохранить её или отменить -->
          <div v-if="aiRow" class="choose">
            <div class="muted small">{{ t('reading.aiBaseForm') }}</div>
            <div><b>{{ aiRow.word }}</b> — {{ aiRow.translation.join(', ') }}</div>
            <div class="muted small">{{ t('reading.aiFormNote', { form: word.trim() || clicked }) }}</div>
            <div class="choose-buttons">
              <UiButton variant="text" @click="aiRow = null">{{ t('reading.cancel') }}</UiButton>
              <UiButton variant="filled" :loading="saving" @click="addAiRow(aiRow)">{{ t('common.save') }}</UiButton>
            </div>
          </div>
          <UiButton v-else variant="filled" icon="add" type="submit" :loading="saving" block>
            {{ t('reading.addToDict') }}
          </UiButton>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.bubble {
  position: fixed;
  z-index: 90;
  display: grid;
  gap: 0.25rem;
  width: max-content;
  min-width: 9rem;
  max-width: min(20rem, calc(100vw - 16px));
  padding: 0.75rem 1rem;
  border-radius: 0.875rem;
  background: var(--popover);
  box-shadow: 0 0.375rem 1.5rem rgb(0 0 0 / 0.22);
}

/* хвостик к слову */
.bubble::before {
  content: "";
  position: absolute;
  top: -0.375rem;
  left: calc(var(--arrow) - 0.375rem);
  width: 0.75rem;
  height: 0.75rem;
  background: inherit;
  transform: rotate(45deg);
  border-radius: 0.125rem;
}
.bubble--above::before { top: auto; bottom: -0.375rem; }

.word {
  font-size: 1.125rem;
  font-weight: 700;
}
.translation { font-size: 1rem; }

/* слово и кнопка озвучки — кнопка компактнее обычной, чтобы не раздувать пузырь */
.head {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.say {
  width: 2.25rem;
  height: 2.25rem;
  margin: -0.375rem -0.5rem -0.375rem 0;
}
.translation--none { font-style: italic; }

.add {
  display: grid;
  gap: 0.625rem;
  width: 17rem;
  max-width: 100%;
}

/* слово выглядит текстом, но его можно поправить (peeped → peep) */
.word-input {
  flex: 1;
  min-width: 0;
  width: 100%;
  padding: 0.125rem 0;
  border: 0;
  border-bottom: 1px dashed var(--outline);
  background: none;
  font: inherit;
  font-size: 1.125rem;
  font-weight: 700;
  color: inherit;
  outline: none;
}
.word-input:focus { border-bottom: 1px solid var(--primary); }

.tr-input {
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--outline);
  border-radius: 0.5rem;
  background: var(--bg);
  color: var(--on);
  font: inherit;
}
.tr-input:focus { outline: none; border-color: var(--primary); }

.error { color: var(--error); }

.choose { display: grid; gap: 0.375rem; }

/* части пузыря (варианты формы, перевод) отделены пунктиром — как слово в заголовке */
.part {
  display: grid;
  gap: 0.375rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--outline);
}
.maybe-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9375rem; }
.small-btn { min-height: 2rem; padding: 0.125rem 0.625rem; font-size: 0.8125rem; }

.choose-buttons { display: flex; justify-content: flex-end; gap: 0.5rem; }

.example {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.25rem 0.625rem;
  cursor: pointer;
}
.box {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.3125rem;
  box-shadow: inset 0 0 0 2px var(--outline);
}
.box--on { background: var(--primary); color: var(--on-primary); box-shadow: none; }
/* пример — под подписью, с её отступом */
.example-text {
  grid-column: 2;
  font-size: 0.9375rem;
  line-height: 1.35;
}

.bubble-enter-active, .bubble-leave-active { transition: opacity 0.15s, transform 0.15s; }
.bubble-enter-from, .bubble-leave-to { opacity: 0; transform: scale(0.96); }
</style>
