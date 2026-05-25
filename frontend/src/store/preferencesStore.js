import { create } from 'zustand'

const usePreferencesStore = create((set) => ({
  language: localStorage.getItem('language') || 'en',
  setLanguage: (language) => {
    localStorage.setItem('language', language)
    set({ language })
  },
}))

export default usePreferencesStore
