"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { LanguageSelector } from "@/components/language-selector"
import { getTranslation } from "@/lib/translations"
import { useLanguage } from "@/hooks/use-language"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"movie" | "tv">("movie")
  const router = useRouter()
  const { language, setLanguage } = useLanguage()

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&type=${searchType}&lang=${language}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector selectedLanguage={language} onLanguageChange={setLanguage} />
      </div>

      {/* Logo */}
      <div className="mb-12">
        <Image
          src="/goodkraken_logo.jpg"
          alt="KrakenPlay"
          width={400}
          height={300}
          className="w-auto h-48 md:h-64"
          priority
        />
      </div>

      <div className="w-full max-w-md mb-4">
        <div className="flex bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setSearchType("movie")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              searchType === "movie" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {getTranslation(language, "movies")}
          </button>
          <button
            onClick={() => setSearchType("tv")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              searchType === "tv" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {getTranslation(language, "tvShows")}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md relative">
        <Input
          type="text"
          placeholder={
            searchType === "movie"
              ? getTranslation(language, "searchPlaceholderMovie")
              : getTranslation(language, "searchPlaceholderTv")
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full h-12 pl-4 pr-12 text-lg bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
        />
        <Button
          onClick={handleSearch}
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Subtitle */}
      <p className="text-gray-400 text-center mt-6 max-w-md">{getTranslation(language, "discover")}</p>
    </div>
  )
}
