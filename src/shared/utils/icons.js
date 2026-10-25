// иконки как компоненты — для пропсов вида :icon у Element Plus (el-button и т.п.)
import { h } from 'vue'
import AppIcon from '../components/AppIcon.vue'

export const icon = name => () => h(AppIcon, { name })
