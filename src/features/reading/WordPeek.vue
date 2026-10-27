<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { words as wordsRepo, DuplicateWordError } from '../../data/index.js'
import { cleanToken, exampleAround } from '../../domain/reading.js'
import { useLibraryStore } from '../../stores/library.js'
import { toast } from '../../shared/ui/feedback.js'
import { pushLayer, popLayer } from '../../shared/ui/backClose.js'
import AppIcon from '../../shared/components/AppIcon.vue'
import UiButton from '../../shared/ui/UiButton.vue'

// пузырь у нажатого слова: известное — слово и перевод; новое — добавить в словарь.
// Под словом, а если снизу не влезает — над ним. Закрывается нажатием мимо и «Назад».
const props = defineProps({
  libraryId: { type: String, required: true },
})

const { t }   = useI18n()
const library = useLibraryStore()

const MARGIN = 8 // px от краёв экрана и от слова

const visible = ref(false)
const found   = ref(null)  // слово из словаря
const word    = ref('')    // новое слово — можно поправить форму
const example = ref('')
const withExample = ref(true)
const error   = ref('')
const saving  = ref(false)

const bubble = ref(null)
const pos    = ref({ top: 0, left: 0, arrow: 0, above: false })

let anchor = null // span слова

// el — span слова, tokens — слова абзаца, k — номер нажатого
async function open(el, tokens, k) {
  const text = cleanToken(tokens[k])
  if (!text) return
  const known = await wordsRepo.find(props.libraryId, text)

  found.value = known
  if (!known) {
    // в английском заглавная — обычно начало предложения; в немецком — ещё и существительное
    word.value        = props.libraryId === 'de' ? text : text.toLowerCase()
    example.value     = exampleAround(tokens, k)
    withExample.value = true
  }
  error.value = ''

  anchor?.classList.remove('w--on')
  anchor = el
  anchor.classList.add('w--on')

  if (!visible.value) {
    visible.value = true
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

function hide() {
  if (!visible.value) return
  visible.value = false
  anchor?.classList.remove('w--on')
  anchor = null
  document.removeEventListener('pointerdown', onOutside, true)
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
  saving.value = true
  try {
    await wordsRepo.create(props.libraryId, {
      word:     text,
      examples: withExample.value && example.value ? [example.value] : [],
    })
    close()
    toast.success(t('words.created'))
    library.load()
  } catch (err) {
    if (err instanceof DuplicateWordError) error.value = t('words.duplicate')
    else toast.error(t('errors.save'))
  } finally {
    saving.value = false
  }
}

onBeforeUnmount(close)

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
        <!-- известное слово -->
        <template v-if="found">
          <b class="word">{{ found.word }}</b>
          <div v-if="found.translation?.length" class="translation">{{ found.translation.join(', ') }}</div>
          <div v-else class="muted translation translation--none">{{ t('status.untranslated') }}</div>
        </template>

        <!-- новое — добавить -->
        <form v-else class="add" @submit.prevent="add">
          <input
              v-model="word"
              class="word word-input"
              :aria-label="t('words.word')"
              :title="t('reading.formHint')"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
          >
          <div v-if="error" class="error small">{{ error }}</div>
          <label v-if="example" class="example">
            <input v-model="withExample" type="checkbox" class="sr-only">
            <span class="box" :class="{ 'box--on': withExample }">
              <AppIcon v-if="withExample" name="check" size="1rem" />
            </span>
            <span class="example-text">
              <span class="muted small">{{ t('reading.addExample') }}</span>
              <span class="small">{{ example }}</span>
            </span>
          </label>
          <UiButton variant="filled" icon="add" type="submit" :loading="saving" block>
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
  background: var(--surface);
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
.translation--none { font-style: italic; }

.add {
  display: grid;
  gap: 0.625rem;
  width: 17rem;
  max-width: 100%;
}

/* слово выглядит текстом, но его можно поправить (peeped → peep) */
.word-input {
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

.error { color: var(--error); }

.example {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  cursor: pointer;
}
.box {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  border-radius: 0.3125rem;
  box-shadow: inset 0 0 0 2px var(--outline);
}
.box--on { background: var(--primary); color: var(--on-primary); box-shadow: none; }
.example-text { display: grid; gap: 0.125rem; }

.bubble-enter-active, .bubble-leave-active { transition: opacity 0.15s, transform 0.15s; }
.bubble-enter-from, .bubble-leave-to { opacity: 0; transform: scale(0.96); }
</style>
