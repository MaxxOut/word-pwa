<script setup>
// единая точка для иконок: экраны используют имена, а не конкретный набор.
// Material Symbols Rounded — SVG из npm, в сборку попадают только перечисленные.
import { computed } from 'vue'
import home        from '@material-symbols/svg-400/rounded/home.svg?raw'
import homeFill    from '@material-symbols/svg-400/rounded/home-fill.svg?raw'
import words       from '@material-symbols/svg-400/rounded/dictionary.svg?raw'
import wordsFill   from '@material-symbols/svg-400/rounded/dictionary-fill.svg?raw'
import study       from '@material-symbols/svg-400/rounded/school.svg?raw'
import repeat      from '@material-symbols/svg-400/rounded/replay.svg?raw'
import settings    from '@material-symbols/svg-400/rounded/settings.svg?raw'
import settingsFill from '@material-symbols/svg-400/rounded/settings-fill.svg?raw'
import reading     from '@material-symbols/svg-400/rounded/menu_book.svg?raw'
import readingFill from '@material-symbols/svg-400/rounded/menu_book-fill.svg?raw'
import castle      from '@material-symbols/svg-400/rounded/castle.svg?raw'
import science     from '@material-symbols/svg-400/rounded/science.svg?raw'
import coffee      from '@material-symbols/svg-400/rounded/coffee.svg?raw'
import toc         from '@material-symbols/svg-400/rounded/toc.svg?raw'
import add         from '@material-symbols/svg-400/rounded/add.svg?raw'
import edit        from '@material-symbols/svg-400/rounded/edit.svg?raw'
import del         from '@material-symbols/svg-400/rounded/delete.svg?raw'
import back        from '@material-symbols/svg-400/rounded/arrow_back.svg?raw'
import close       from '@material-symbols/svg-400/rounded/close.svg?raw'
import speak       from '@material-symbols/svg-400/rounded/volume_up.svg?raw'
import importIcon  from '@material-symbols/svg-400/rounded/upload.svg?raw'
import exportIcon  from '@material-symbols/svg-400/rounded/download.svg?raw'
import search      from '@material-symbols/svg-400/rounded/search.svg?raw'
import check       from '@material-symbols/svg-400/rounded/check.svg?raw'
import more        from '@material-symbols/svg-400/rounded/more_vert.svg?raw'
import dropdown    from '@material-symbols/svg-400/rounded/keyboard_arrow_down.svg?raw'
import hint        from '@material-symbols/svg-400/rounded/lightbulb.svg?raw'
import backspace   from '@material-symbols/svg-400/rounded/backspace.svg?raw'
import warning     from '@material-symbols/svg-400/rounded/warning.svg?raw'
import info        from '@material-symbols/svg-400/rounded/info.svg?raw'
import minus       from '@material-symbols/svg-400/rounded/remove.svg?raw'
import share       from '@material-symbols/svg-400/rounded/ios_share.svg?raw'
import filter      from '@material-symbols/svg-400/rounded/filter_list.svg?raw'
import schedule    from '@material-symbols/svg-400/rounded/schedule.svg?raw'
import south       from '@material-symbols/svg-400/rounded/south.svg?raw'
import north       from '@material-symbols/svg-400/rounded/north.svg?raw'
import lightMode   from '@material-symbols/svg-400/rounded/light_mode.svg?raw'
import darkMode    from '@material-symbols/svg-400/rounded/dark_mode.svg?raw'
import autoMode    from '@material-symbols/svg-400/rounded/brightness_auto.svg?raw'

const ICONS = {
  home, 'home-fill': homeFill,
  words, 'words-fill': wordsFill,
  study, repeat,
  reading, 'reading-fill': readingFill,
  castle, science, coffee, toc,
  settings, 'settings-fill': settingsFill,
  add, edit, delete: del, back, close, speak,
  import: importIcon, export: exportIcon,
  search, check, more, dropdown, hint, backspace, warning, info, minus, share,
  filter, schedule, south, north,
  light: lightMode, dark: darkMode, system: autoMode,
}

const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: '1.5rem' },
})

const svg = computed(() => ICONS[props.name] ?? '')
</script>

<template>
  <span class="icon" :style="{ '--size': size }" aria-hidden="true" v-html="svg" />
</template>

<style scoped>
.icon {
  display: inline-flex;
  width: var(--size);
  height: var(--size);
  flex-shrink: 0;
}
.icon :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
}
</style>
