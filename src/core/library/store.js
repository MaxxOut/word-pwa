import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { librariesRepo } from './repo.js'
import { useSettingsStore } from '@/core/settings/store.js'

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
