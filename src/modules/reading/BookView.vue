<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { readingRepo } from './repo.js'
import { removeTexts, removeUserText } from './texts.js'
import { parseChapter, readPercent, chapterSizes, wordsToStudy } from './domain.js'
import { useSettingsStore } from '@/core/settings/store.js'
import { goBack } from '@/shared/utils/navigation.js'
import AppIcon from '@/shared/components/AppIcon.vue'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import UiSheet from '@/shared/ui/UiSheet.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import { confirm, toast } from '@/shared/ui/feedback.js'
import WordPeek from './WordPeek.vue'

// книга: глава разбита на страницы CSS-колонками шириной в экран, лента колонок сдвигается.
// Место чтения — номер первого слова на странице: после поворота экрана или смены шрифта
// страницы пересчитываются, и открывается та же страница по смыслу.
// Текст уже загружен — это делает ReaderView
const props = defineProps({
  text: { type: Object, required: true },
})

const router        = useRouter()
const { t }         = useI18n()
const settingsStore = useSettingsStore()

const text = props.text

const GAP       = 48   // px между колонками-страницами
const THRESHOLD = 0.15 // доля ширины, чтобы перелистнуть
const FLICK     = 0.3  // px/мс — быстрый взмах листает и на коротком пути

const chapter  = ref(0)
const page     = ref(0)
const pages    = ref(1)
const ready    = ref(false)
const contents = ref(false)

const viewport = ref(null)
const flow     = ref(null)

let stride      = 0
let currentWord = 0

const lastChapter = computed(() => text.chapters.length - 1)
const paragraphs  = computed(() => parseChapter(text.chapters[chapter.value].text))
const chapterTitle = computed(() => text.chapters[chapter.value].title ?? '')

// полоса прогресса книги: отрезок на главу (ширина — по числу слов), разделены зазором
const segments = computed(() => {
  const sizes = chapterSizes(text)
  const total = sizes.reduce((a, b) => a + b, 0)
  return sizes.map((size, i) => ({
    width: (size / total) * 100,
    fill:  i < chapter.value ? 100 : i > chapter.value ? 0 : ((page.value + 1) / pages.value) * 100,
  }))
})
const bookPercent = computed(() => Math.round(segments.value.reduce((a, s) => a + (s.width * s.fill) / 100, 0)))

// ----- сквозные страницы книги -----
// Страниц в главе — раскладкой её текста в скрытой ленте той же ширины (по главе за раз, не мешая листать).
// Пока глава не посчитана — оценка по словам на странице текущей главы. Текущая глава — по настоящей раскладке
const measure      = ref(null)
const chapterPages = ref([]) // страниц в каждой главе при текущем размере; null — ещё не посчитано
let measureKey = ''
let measureRun = 0

function measureAll() {
  const el = measure.value
  if (!el || !flow.value) return
  const key = `${stride}x${viewport.value.getBoundingClientRect().height}x${getComputedStyle(flow.value).fontSize}`
  if (key === measureKey) return
  measureKey = key
  const run = ++measureRun
  el.style.width       = flow.value.style.width
  el.style.columnWidth = flow.value.style.columnWidth
  // стили абзацев scoped — абзацам ленты нужен тот же атрибут, что у книги
  const scope = flow.value.getAttributeNames().find(a => a.startsWith('data-v-'))
  chapterPages.value = text.chapters.map(() => null)
  let i = 0
  const step = () => {
    if (run !== measureRun || !measure.value) return
    el.replaceChildren(...text.chapters[i].text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => {
      const node = document.createElement('p')
      if (scope) node.setAttribute(scope, '')
      node.textContent = p.split(/\s+/).join(' ')
      return node
    }))
    const next = [...chapterPages.value]
    next[i] = Math.max(1, Math.round((el.scrollWidth + GAP) / stride))
    chapterPages.value = next
    if (++i < text.chapters.length) setTimeout(step, 0)
    else el.replaceChildren()
  }
  setTimeout(step, 0)
}

const pagesOf = computed(() => {
  const sizes   = chapterSizes(text)
  const perPage = Math.max(1, sizes[chapter.value] / pages.value)
  return sizes.map((size, i) => (i === chapter.value ? pages.value : chapterPages.value[i] ?? Math.max(1, Math.round(size / perPage))))
})
const bookPage   = computed(() => pagesOf.value.slice(0, chapter.value).reduce((a, b) => a + b, 0) + page.value + 1)
const bookPages  = computed(() => pagesOf.value.reduce((a, b) => a + b, 0))

// ----- раскладка -----

function spans() {
  return flow.value.querySelectorAll('.w')
}

function columnOf(el) {
  const left = el.getBoundingClientRect().left - flow.value.getBoundingClientRect().left
  return Math.floor((left + 1) / stride)
}

// первое слово страницы — двоичный поиск: колонки слов идут по возрастанию
function firstWordOf(p) {
  const list = spans()
  let lo = 0
  let hi = list.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (columnOf(list[mid]) < p) lo = mid + 1
    else hi = mid
  }
  return lo
}

function pageOfWord(i) {
  const list = spans()
  if (!list.length) return 0
  return Math.min(columnOf(list[Math.min(i, list.length - 1)]), pages.value - 1)
}

function setOffset(dx = 0, animate = false) {
  const el = flow.value
  el.style.transition = animate ? 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)' : 'none'
  el.style.transform  = `translateX(${-page.value * stride + dx}px)`
}

// word — номер слова, которое должно быть видно; 'end' — последняя страница
function layout(word) {
  const vp = viewport.value
  const el = flow.value
  if (!vp || !el) return
  const width  = vp.getBoundingClientRect().width
  stride = width + GAP
  el.style.width       = `${width}px`
  el.style.columnWidth = `${width}px`
  pages.value = Math.max(1, Math.round((el.scrollWidth + GAP) / stride))
  page.value  = word === 'end' ? pages.value - 1 : pageOfWord(word)
  setOffset()
  // слово сохраняем то же, а не первое на странице: иначе при каждом пересчёте (клавиатура,
  // поворот) оно сдвигается к началу страницы и книга отматывается назад
  currentWord = word === 'end' ? firstWordOf(page.value) : word
  measureAll()
}

// ----- листание -----

async function openChapter(index, word = 0) {
  chapter.value = index
  await nextTick()
  layout(word)
  save()
}

function go(target) {
  peek.value?.close()
  if (target >= pages.value) {
    if (chapter.value < lastChapter.value) return openChapter(chapter.value + 1)
    return setOffset(0, true) // конец книги
  }
  if (target < 0) {
    if (chapter.value > 0) return openChapter(chapter.value - 1, 'end')
    return setOffset(0, true)
  }
  page.value = target
  setOffset(0, true)
  currentWord = firstWordOf(target)
  save()
}

function chooseChapter(index) {
  contents.value = false
  openChapter(index)
}

// ----- жесты: свайп листает, нажатие у края — тоже -----

let touch = null

function onTouchStart(e) {
  if (e.touches.length !== 1) return
  const p = e.touches[0]
  touch = { x: p.clientX, y: p.clientY, t: e.timeStamp, dx: 0, horizontal: null }
}

function atEdge(dir) {
  return dir > 0
    ? page.value === pages.value - 1 && chapter.value === lastChapter.value
    : page.value === 0 && chapter.value === 0
}

function onTouchMove(e) {
  if (!touch) return
  const p  = e.touches[0]
  const mx = p.clientX - touch.x
  const my = p.clientY - touch.y
  if (touch.horizontal === null) {
    if (Math.abs(mx) < 8 && Math.abs(my) < 8) return
    touch.horizontal = Math.abs(mx) > Math.abs(my)
  }
  if (!touch.horizontal) return
  e.preventDefault()
  peek.value?.close()
  // дальше листать некуда — тянется с сопротивлением
  touch.dx = atEdge(mx < 0 ? 1 : -1) ? mx / 3 : mx
  setOffset(touch.dx)
}

function onTouchEnd(e) {
  if (!touch) return
  const { dx, t: start, horizontal } = touch
  touch = null
  if (!horizontal) return
  const speed = Math.abs(dx) / Math.max(e.timeStamp - start, 1)
  if (Math.abs(dx) > stride * THRESHOLD || speed > FLICK) go(page.value + (dx < 0 ? 1 : -1))
  else setOffset(0, true)
}

// нажатие на слово — шторка со словом (листание — только свайпом)
const peek = ref(null)

function onWordClick(e) {
  const el = e.target.closest('.w')
  if (!el) return
  const i    = Number(el.dataset.i)
  const para = paragraphs.value.find(p => p[0].i <= i && i <= p[p.length - 1].i)
  if (!para) return
  peek.value.open(el, para.map(w => w.t), i - para[0].i)
}

function onKey(e) {
  if (contents.value) return
  if (e.key === 'ArrowRight' || e.key === 'PageDown') go(page.value + 1)
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(page.value - 1)
}

// ----- место чтения -----

let saveTimer = null

function save() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(flush, 400)
}

const isAtEnd = () => chapter.value === lastChapter.value && page.value === pages.value - 1
let wasAtEnd = true // где был при прошлом сохранении (при открытии — где открыли)

function flush() {
  clearTimeout(saveTimer)
  if (!ready.value || removed) return
  const atEnd   = isAtEnd()
  const reached = atEnd && !wasAtEnd
  wasAtEnd = atEnd
  readingRepo.save({
    text_id:    text.id,
    library_id: text.library_id,
    chapter:    chapter.value,
    word:       currentWord,
    percent:    atEnd ? 100 : readPercent(text, chapter.value, currentWord),
    // дошёл до конца — «прочитан»; снятый кнопкой в конце остаётся снятым, пока снова не дойдёшь
    ...(reached && !progress.value?.finished && { finished: true }),
  }).then(row => { progress.value = row }).catch(() => {})
}

// ----- в конце: «Прочитан» и «Изучен» — переключатели, независимо друг от друга -----

const progress  = ref(null) // запись о чтении
const textWords = ref([])   // слова словаря, связанные с текстом
const FLAGS     = ['finished', 'learned']
const toStudy   = computed(() => wordsToStudy(textWords.value))

async function loadWords() {
  textWords.value = await readingRepo.words(text).catch(() => [])
}

// слово добавили из книги — связать с текстом
async function onLinked(id) {
  await readingRepo.link(text.id, text.library_id, id).catch(() => {})
  loadWords()
}

const flagOn = flag => !!(flag === 'learned' ? (progress.value?.learned ?? progress.value?.done) : progress.value?.[flag])

async function toggle(flag) {
  try {
    progress.value = await readingRepo.save({ text_id: text.id, library_id: text.library_id, [flag]: !flagOn(flag) })
  } catch {
    toast.error(t('errors.save'))
  }
}

function studyText() {
  if (!toStudy.value.length) {
    toast(t('reading.stage.nothingToStudy'))
    return
  }
  router.push({ name: 'study', query: { ids: toStudy.value.map(w => w.id).join(',') } })
}

// кнопки в конце меняются — число страниц главы могло измениться; страница та же
watch([() => toStudy.value.length, () => textWords.value.length], async () => {
  if (!ready.value || chapter.value !== lastChapter.value) return
  await nextTick()
  pages.value = Math.max(1, Math.round((flow.value.scrollWidth + GAP) / stride))
  page.value  = Math.min(page.value, pages.value - 1)
  setOffset()
})

// ----- тема прямо из книги -----

const isDark = computed(() => {
  const a = settingsStore.settings.appearance
  return a === 'dark' || (a === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
})

function toggleTheme() {
  settingsStore.update({ appearance: isDark.value ? 'light' : 'dark' })
}

// место чтения остаётся — скачать снова можно в любой момент
// встроенный — место чтения остаётся, скачать снова можно в любой момент;
// своя книга — навсегда, вместе с местом чтения
let removed = false

async function removeFromPhone() {
  const message = text.user ? t('reading.mine.removeConfirm', { title: text.title }) : t('reading.removeTextConfirm')
  if (!await confirm({ message, confirmText: t('common.delete'), danger: true })) return
  if (text.user) {
    removed = true
    clearTimeout(saveTimer)
    await removeUserText(text.id)
  } else {
    await removeTexts([text.id])
  }
  toast(t('reading.removed', { n: 1 }))
  back()
}

function back() {
  goBack(router, text.user ? { name: 'reading-mine' } : { name: 'reading-topic', params: { topic: text.topic } })
}

// экран повернули, сменили размер текста — пересчитать страницы, остаться на том же слове
let resizeObserver = null
let lastSize = ''

onMounted(async () => {
  const saved = await readingRepo.get(text.id).catch(() => null)
  if (saved) {
    chapter.value = Math.min(saved.chapter, lastChapter.value)
  }
  progress.value = saved ?? null
  loadWords()
  await nextTick()
  await document.fonts?.ready
  layout(saved?.word ?? 0)
  wasAtEnd    = isAtEnd()
  ready.value = true

  resizeObserver = new ResizeObserver(([entry]) => {
    const width = Math.round(entry.contentRect.width)
    onResize(width, `${width}x${Math.round(entry.contentRect.height)}`)
  })
  resizeObserver.observe(viewport.value)
  window.addEventListener('keydown', onKey)
})

// размер, отложенный, пока открыт пузырь с полем ввода (см. onResize)
let pendingSize = null

// force — пузырь закрыт: поле в нём ещё может держать фокус, но клавиатура уже не повод ждать
function onResize(width, size, force = false) {
  pendingSize = null
  if (size === lastSize) return
  // открылась/закрылась клавиатура (поле в пузыре — перевод, ответ ИИ): меняется только высота —
  // пузырь не закрываем и страницы не пересчитываем, иначе в поле не попасть.
  // Пересчёт — когда пузырь закроется (onPeekClosed)
  if (!force && width === Number(lastSize.split('x')[0]) && document.activeElement?.matches('input, textarea')) {
    pendingSize = { width, size }
    return
  }
  lastSize = size
  peek.value?.close()
  layout(currentWord)
}

function onPeekClosed() {
  if (pendingSize) onResize(pendingSize.width, pendingSize.size, true)
}

onBeforeUnmount(() => {
  flush()
  resizeObserver?.disconnect()
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="reader">
    <header class="reader-top">
      <UiIconButton icon="back" :label="t('common.back')" @click="back" />
      <div class="heading">
        <h2 class="heading-title">{{ text.title }}</h2>
        <div v-if="text.chapters.length > 1" class="muted small heading-sub">
          <b class="chapter-no">{{ t('reading.chapterOf', { n: chapter + 1, total: text.chapters.length }) }}</b>
          <template v-if="chapterTitle"> · {{ chapterTitle }}</template>
        </div>
      </div>
    </header>

    <!-- прогресс книги и рядом — оглавление -->
    <div class="progress-row">
      <div class="book-progress" role="progressbar" :aria-valuenow="bookPercent" aria-valuemin="0" aria-valuemax="100">
        <span v-for="(s, i) in segments" :key="i" class="seg" :style="{ flexGrow: s.width }">
          <span class="seg-fill" :style="{ width: `${s.fill}%` }" />
        </span>
      </div>
      <UiIconButton
          v-if="text.chapters.length > 1"
          icon="toc"
          class="toc-btn"
          :label="t('reading.contents')"
          @click="contents = true"
      />
    </div>

    <div
        ref="viewport"
        class="viewport"
        @touchstart.passive="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
        @click="onWordClick"
        @scroll="viewport.scrollLeft = 0"
    >
      <article ref="flow" class="flow" :lang="text.library_id" :class="{ 'flow--ready': ready }">
        <p v-for="(para, pi) in paragraphs" :key="`${chapter}-${pi}`">
          <template v-for="w in para" :key="w.i"><span class="w" :data-i="w.i">{{ w.t }}</span>{{ ' ' }}</template>
        </p>
        <footer v-if="chapter === lastChapter" class="end">
          <div class="end-mark">{{ t('reading.end') }}</div>
          <div v-if="text.source" class="muted small">{{ t('reading.source', { s: text.source }) }}</div>
          <div class="stage">
            <div class="stage-chips">
              <button
                  v-for="f in FLAGS"
                  :key="f"
                  v-ripple
                  type="button"
                  role="checkbox"
                  class="chip"
                  :class="{ 'chip--on': flagOn(f) }"
                  :aria-checked="flagOn(f)"
                  @click="toggle(f)"
              >
                <AppIcon v-if="flagOn(f)" name="check" size="1.125rem" />
                {{ t(`reading.stage.${f}`) }}
              </button>
            </div>
            <span v-if="textWords.length" class="muted small">
              {{ t('reading.stage.words', { n: textWords.length - toStudy.length, total: textWords.length }) }}
            </span>
            <UiButton v-if="$router.hasRoute('study') && toStudy.length" variant="outlined" icon="text-words" @click="studyText">
              {{ t('reading.stage.study', { n: toStudy.length }) }}
            </UiButton>
          </div>
          <UiButton variant="text" icon="delete" @click="removeFromPhone">{{ text.user ? t('reading.mine.remove') : t('reading.removeText') }}</UiButton>
        </footer>
      </article>
      <!-- скрытая лента: считает страницы остальных глав для сквозной нумерации -->
      <article ref="measure" class="flow flow-measure" :lang="text.library_id" aria-hidden="true" />
    </div>

    <!-- слева тема, по центру страницы -->
    <footer class="reader-foot">
      <UiIconButton
          class="theme-btn"
          :icon="isDark ? 'light' : 'dark'"
          :label="t('reading.theme')"
          @click="toggleTheme"
      />
      <span class="num counter">{{ bookPage }} / {{ bookPages }}</span>
    </footer>

    <WordPeek ref="peek" :library-id="text.library_id" @closed="onPeekClosed" @linked="onLinked" />

    <UiSheet v-model="contents" :title="t('reading.contents')">
      <ol class="toc">
        <li v-for="(c, i) in text.chapters" :key="i">
          <button
              v-ripple
              type="button"
              class="toc-item"
              :aria-current="i === chapter ? 'true' : undefined"
              @click="chooseChapter(i)"
          >
            <span class="num toc-num">{{ i + 1 }}</span>
            <span class="grow">{{ c.title }}</span>
          </button>
        </li>
      </ol>
    </UiSheet>
  </div>
</template>

<style scoped>
.reader {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - env(safe-area-inset-top));
}

.reader-top {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0 -0.5rem;
  padding: 0.5rem 0 0;
}

.heading {
  flex: 1;
  min-width: 0;
}
.heading-title {
  font-size: 1.0625rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.heading-sub {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-no { font-weight: 600; color: var(--on); }

/* как полоса в занятии; зазор между отрезками отмечает границы глав */
.progress-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  /* высота как у кнопки оглавления — без глав отступ до текста тот же */
  min-height: var(--touch);
  margin-bottom: 0.25rem;
}
.toc-btn { margin-right: -0.5rem; }

.book-progress {
  flex: 1;
  display: flex;
  gap: 3px;
}
.seg {
  flex-basis: 0;
  height: 0.375rem;
  border-radius: 0.1875rem;
  background: var(--container-hi);
  overflow: hidden;
}
.seg-fill {
  display: block;
  height: 100%;
  background: var(--primary);
  transition: width 0.3s;
}

.viewport {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  /* свайп обрабатываем сами, вертикальной прокрутки здесь нет */
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

.flow {
  height: 100%;
  column-gap: 48px; /* = GAP в скрипте */
  column-fill: auto;
  font-size: 1.1875rem;
  line-height: 1.6;
  text-align: justify;
  hyphens: auto;
  -webkit-hyphens: auto;
  overflow-wrap: break-word;
  /* до расчёта страниц текст не показываем — иначе мелькнёт одной длинной колонкой */
  visibility: hidden;
}
.flow--ready { visibility: visible; }

/* лента для подсчёта страниц — та же вёрстка, но невидима и вне потока */
.flow-measure {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.flow p { margin-bottom: 0.75em; }

/* слово с открытым пузырём */
.flow :deep(.w--on) {
  border-radius: 0.25rem;
  background: var(--primary-c);
  color: var(--on-primary-c);
  box-shadow: 0 0 0 0.125rem var(--primary-c);
}

.end {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding: 1.5rem 0;
  text-align: center;
  break-inside: avoid;
}
.stage {
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
}
.stage-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.375rem;
}
.end-mark {
  font-family: var(--font-title);
  font-weight: 700;
  color: var(--muted);
}

.reader-foot {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0.25rem 0 calc(0.25rem + env(safe-area-inset-bottom));
}
.theme-btn { justify-self: start; margin-left: -0.5rem; }
.counter {
  font-size: 0.875rem;
  color: var(--muted);
}

.toc {
  display: grid;
  gap: 0.25rem;
  list-style: none;
}
.toc-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  min-height: var(--touch);
  padding: 0.5rem 0.75rem;
  border: 0;
  border-radius: 0.625rem;
  background: none;
  text-align: left;
}
.toc-item[aria-current="true"] { background: var(--primary-c); color: var(--on-primary-c); font-weight: 600; }
.toc-num { width: 1.5rem; color: inherit; opacity: 0.7; }
</style>
