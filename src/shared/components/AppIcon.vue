<script setup>
// единая точка для иконок: экраны используют имена, а не конкретный набор.
// Сменить набор (например на Material Symbols) — поменять только этот файл.
import {
  House, Collection, Reading, RefreshRight, Setting, Plus, Edit, Delete,
  ArrowLeft, Headset, Fold, Upload, Download,
} from '@element-plus/icons-vue'

const ICONS = {
  home:     House,
  words:    Collection,
  study:    Reading,
  repeat:   RefreshRight,
  settings: Setting,
  add:      Plus,
  edit:     Edit,
  delete:   Delete,
  back:     ArrowLeft,
  speak:    Headset,
  menu:     Fold,
  import:   Upload,
  export:   Download,
}

defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: undefined },
})
</script>

<template>
  <el-icon :size="size"><component :is="ICONS[name]" /></el-icon>
</template>
