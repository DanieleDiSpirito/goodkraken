"use client"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Language } from "@/lib/translations"

interface LanguageOption {
  code: Language
  name: string
  flag: string
  apiCode: string
}

const languages: LanguageOption[] = [
  { code: "it", name: "Italiano", flag: "🇮🇹", apiCode: "it-IT" },
  { code: "en", name: "English", flag: "🇺🇸", apiCode: "en-US" },
  { code: "es", name: "Español", flag: "🇪🇸", apiCode: "es-ES" },
  { code: "fr", name: "Français", flag: "🇫🇷", apiCode: "fr-FR" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", apiCode: "de-DE" },
]

interface LanguageSelectorProps {
  selectedLanguage: Language
  onLanguageChange: (language: Language) => void
}

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const currentLanguage = languages.find((lang) => lang.code === selectedLanguage) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 px-3 bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 z-50"
        >
          <span className="text-lg mr-2">{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 z-50">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className="text-white hover:bg-gray-800 cursor-pointer"
          >
            <span className="text-lg mr-3">{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function getApiLanguageCode(language: Language): string {
  const lang = languages.find((l) => l.code === language)
  return lang?.apiCode || "it-IT"
}
