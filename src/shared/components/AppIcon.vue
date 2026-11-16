<script>
// единая точка для иконок: экраны используют имена, а не конкретный набор.
// Material Symbols Rounded — SVG из npm, в сборку попадают только перечисленные.
// Здесь — общие иконки; модули добавляют свои через registerIcons (поле icons в index.js модуля)
import home        from '@material-symbols/svg-400/rounded/home.svg?raw'
import homeFill    from '@material-symbols/svg-400/rounded/home-fill.svg?raw'
import settings    from '@material-symbols/svg-400/rounded/settings.svg?raw'
import settingsFill from '@material-symbols/svg-400/rounded/settings-fill.svg?raw'
import add         from '@material-symbols/svg-400/rounded/add.svg?raw'
import edit        from '@material-symbols/svg-400/rounded/edit.svg?raw'
import del         from '@material-symbols/svg-400/rounded/delete.svg?raw'
import back        from '@material-symbols/svg-400/rounded/arrow_back.svg?raw'
import close       from '@material-symbols/svg-400/rounded/close.svg?raw'
import speak       from '@material-symbols/svg-400/rounded/volume_up.svg?raw'
import mute        from '@material-symbols/svg-400/rounded/volume_off.svg?raw'
import paste       from '@material-symbols/svg-400/rounded/content_paste.svg?raw'
import gTranslate  from '@material-symbols/svg-400/rounded/g_translate.svg?raw'
import translate   from '@material-symbols/svg-400/rounded/translate.svg?raw'
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
import tune        from '@material-symbols/svg-400/rounded/tune.svg?raw'
import tuneFill    from '@material-symbols/svg-400/rounded/tune-fill.svg?raw'
import database    from '@material-symbols/svg-400/rounded/database.svg?raw'
import databaseFill from '@material-symbols/svg-400/rounded/database-fill.svg?raw'

const ICONS = {
  home, 'home-fill': homeFill,
  settings, 'settings-fill': settingsFill,
  add, edit, delete: del, back, close, speak, mute, paste, 'g-translate': gTranslate, translate,
  import: importIcon, export: exportIcon,
  search, check, more, dropdown, hint, backspace, warning, info, minus, share,
  filter, schedule, south, north,
  light: lightMode, dark: darkMode, system: autoMode,
  tune, 'tune-fill': tuneFill, database, 'database-fill': databaseFill,
}

export const hasIcon = name => name in ICONS

export function registerIcons(icons) {
  for (const [name, svg] of Object.entries(icons)) {
    if (name in ICONS && ICONS[name] !== svg) throw new Error(`icon "${name}" is already registered`)
    ICONS[name] = svg
  }
}
</script>

<script setup>
import { computed } from 'vue'

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
