"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { LanguageSelector, getApiLanguageCode } from "@/components/language-selector"
import { getTranslation } from "@/lib/translations"
import { useLanguage } from "@/hooks/use-language"
import type { Language } from "@/lib/translations"

interface Movie {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  overview: string
  vote_average: number
  vote_count: number
}

interface TVShow {
  id: number
  name: string
  poster_path: string | null
  first_air_date: string
  overview: string
  vote_average: number
  vote_count: number
}

interface TMDBResponse {
  results: (Movie | TVShow)[]
  total_pages: number
  total_results: number
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { language: globalLanguage, setLanguage: setGlobalLanguage } = useLanguage()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [searchType, setSearchType] = useState<"movie" | "tv">((searchParams.get("type") as "movie" | "tv") || "movie")
  const [language, setLanguage] = useState<Language>(globalLanguage)
  const [results, setResults] = useState<(Movie | TVShow)[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const debounceTimeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()
  const lastQueryRef = useRef<string>("")
  const lastTypeRef = useRef<string>("")
  const lastLanguageRef = useRef<string>("")

  const searchContent = useCallback(async (query: string, type: "movie" | "tv", lang: Language) => {
    const searchKey = `${query}-${type}-${lang}`
    if (!query.trim() || searchKey === `${lastQueryRef.current}-${lastTypeRef.current}-${lastLanguageRef.current}`)
      return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    lastQueryRef.current = query
    lastTypeRef.current = type
    lastLanguageRef.current = lang

    setLoading(true)
    setError("")

    try {
      const apiLangCode = getApiLanguageCode(lang)
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}&lang=${apiLangCode}`, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(getTranslation(lang, "noResultsFound")) // Using a placeholder, should add proper error messages to translations
        }
        throw new Error(getTranslation(lang, "noResultsFound")) // Using a placeholder, should add proper error messages to translations
      }

      const data: TMDBResponse = await response.json()
      setResults(data.results)
    } catch (err: any) {
      if (err.name === "AbortError") {
        return
      }
      setError(err.message || "Errore durante la ricerca. Riprova più tardi.")
      console.error("Search error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const query = searchParams.get("q")
    const type = (searchParams.get("type") as "movie" | "tv") || "movie"
    const urlLang = searchParams.get("lang")

    const currentLang = urlLang ? (urlLang.split("-")[0] as Language) : globalLanguage

    if (
      query &&
      (query !== lastQueryRef.current || type !== lastTypeRef.current || currentLang !== lastLanguageRef.current)
    ) {
      setSearchQuery(query)
      setSearchType(type)
      setLanguage(currentLang)

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        searchContent(query, type, currentLang)
      }, 300)
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [searchParams, searchContent, globalLanguage])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(
        `/search?q=${encodeURIComponent(searchQuery.trim())}&type=${searchType}&lang=${getApiLanguageCode(language)}`,
      )
    }
  }

  const handleTypeChange = (newType: "movie" | "tv") => {
    setSearchType(newType)
    if (searchQuery.trim()) {
      router.push(
        `/search?q=${encodeURIComponent(searchQuery.trim())}&type=${newType}&lang=${getApiLanguageCode(language)}`,
      )
    }
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    setGlobalLanguage(newLanguage)
    if (searchQuery.trim()) {
      const apiLangCode = getApiLanguageCode(newLanguage)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&type=${searchType}&lang=${apiLangCode}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleItemClick = (item: Movie | TVShow) => {
    const apiLangCode = getApiLanguageCode(language)
    if (searchType === "movie") {
      router.push(`/movie/${item.id}?lang=${apiLangCode}`)
    } else {
      router.push(`/tv/${item.id}?lang=${apiLangCode}`)
    }
  }

  const getYear = (date: string) => {
    return date ? date.split("-")[0] : "N/A"
  }

  const getPosterUrl = (posterPath: string | null) => {
    return posterPath ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${posterPath}` : "/movie-poster-placeholder.png"
  }

  const getTitle = (item: Movie | TVShow) => {
    return "title" in item ? item.title : item.name
  }

  const getReleaseDate = (item: Movie | TVShow) => {
    return "release_date" in item ? item.release_date : item.first_air_date
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-white hover:bg-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {getTranslation(language, "back")}
          </Button>

          <div className="flex bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => handleTypeChange("movie")}
              className={`py-1 px-3 rounded-md text-sm font-medium transition-colors ${
                searchType === "movie" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {getTranslation(language, "movies")}
            </button>
            <button
              onClick={() => handleTypeChange("tv")}
              className={`py-1 px-3 rounded-md text-sm font-medium transition-colors ${
                searchType === "tv" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {getTranslation(language, "tvShows")}
            </button>
          </div>

          <div className="flex-1 max-w-md relative">
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
              className="w-full h-10 pl-4 pr-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
            />
            <Button
              onClick={handleSearch}
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <LanguageSelector selectedLanguage={language} onLanguageChange={handleLanguageChange} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {loading && (
          <div className="text-center py-12">
            <div className="text-lg">{getTranslation(language, "loadingResearch")}</div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg">{error}</div>
          </div>
        )}

        {!loading && !error && results.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">{getTranslation(language, "noResults")} "{searchQuery}"</div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <h1 className="text-2xl font-bold mb-6">
              {getTranslation(language, "resultsFor")} "{searchQuery}" ({results.length}{" "}
              {searchType === "movie"
                ? getTranslation(language, "movies").toLowerCase()
                : getTranslation(language, "tvShows").toLowerCase()}
              )
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {results.map((item) => (
                <Card
                  key={item.id}
                  className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer group"
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-[2/3] relative overflow-hidden rounded-t-lg">
                      <Image
                        src={getPosterUrl(item.poster_path) || "/placeholder.svg"}
                        alt={getTitle(item)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">{getTitle(item)}</h3>
                      <p className="text-gray-400 text-xs">{getYear(getReleaseDate(item))}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
