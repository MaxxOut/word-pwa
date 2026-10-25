import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { libraries as librariesRepo } from '../data/index.js'
import { useSettingsStore } from './settings.js'

// активная библиотека — одна, выбор хранится в настройках (current_library_id)
export const useLibraryStore = defineStore('library', () => {
  const settingsStore = useSettingsStore()
  const libraries     = ref([])

  const currentId = computed(() => settingsStore.settings.current_library_id)
  const current   = computed(() =>
    libraries.value.find(l => l.id === currentId.value) ?? libraries.value[0] ?? null,
  )

  async function load() {
    libraries.value = await librariesRepo.list()
  }

  async function select(id) {
    await settingsStore.update({ current_library_id: id })
  }

  return { libraries, current, load, select }
})
