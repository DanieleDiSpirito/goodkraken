"use client"

import { useState, useEffect } from "react"
import type { Language } from "@/lib/translations"

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>("it")

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("goodkraken-language")
    if (savedLanguage && ["it", "en", "es", "fr", "de"].includes(savedLanguage)) {
      setLanguageState(savedLanguage as Language)
    }
  }, [])

  // Save language to localStorage when it changes
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem("goodkraken-language", newLanguage)
  }

  return { language, setLanguage }
}
