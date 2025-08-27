"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Play, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { LanguageSelector, getApiLanguageCode } from "@/components/language-selector"
import { getTranslation } from "@/lib/translations"
import { useLanguage } from "@/hooks/use-language"
import type { Language } from "@/lib/translations"

interface TVSeriesDetails {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  last_air_date: string
  overview: string
  vote_average: number
  vote_count: number
  number_of_seasons: number
  number_of_episodes: number
  genres: { id: number; name: string }[]
  seasons: { id: number; season_number: number; name: string; episode_count: number }[]
}

interface Episode {
  id: number
  episode_number: number
  name: string
  overview: string
  air_date: string
}

interface SeasonDetails {
  id: number
  season_number: number
  name: string
  episodes: Episode[]
}

export default function TVSeriesDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const tvId = params.id as string
  const languageReq = searchParams.get("lang") || "it-IT"
  const { language, setLanguage } = useLanguage()
  const [tvSeries, setTVSeries] = useState<TVSeriesDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showPlayer, setShowPlayer] = useState(false)
  const [streamingUrl, setStreamingUrl] = useState("")
  const [selectedSeason, setSelectedSeason] = useState<string>("")
  const [selectedEpisode, setSelectedEpisode] = useState<string>("")
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null)
  const [loadingSeason, setLoadingSeason] = useState(false)

  useEffect(() => {
    const fetchTVSeriesDetails = async () => {
      try {
        const response = await fetch(`/api/tv/${tvId}?lang=${languageReq}`)

        if (!response.ok) {
          throw new Error("Serie TV non trovata")
        }

        const data: TVSeriesDetails = await response.json()
        setTVSeries(data)
      } catch (err) {
        setError("Errore nel caricamento della serie TV")
        console.error("TV series fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    if (tvId) {
      fetchTVSeriesDetails()
    }
  }, [tvId])

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      if (!selectedSeason || !tvId) return

      setLoadingSeason(true)
      try {
        const response = await fetch(`/api/tv/${tvId}/seasons?season=${selectedSeason}&lang=${languageReq}`)

        if (!response.ok) {
          throw new Error("Errore nel caricamento della stagione")
        }

        const data: SeasonDetails = await response.json()
        setSeasonDetails(data)
        setSelectedEpisode("") // Reset episode selection when season changes
      } catch (err) {
        console.error("Season fetch error:", err)
        setSeasonDetails(null)
      } finally {
        setLoadingSeason(false)
      }
    }

    fetchSeasonDetails()
  }, [selectedSeason, tvId])

  const getPosterUrl = (posterPath: string | null) => {
    return posterPath ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${posterPath}` : "/movie-poster-placeholder.png"
  }

  const getBackdropUrl = (backdropPath: string | null) => {
    return backdropPath ? `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${backdropPath}` : null
  }

  const getYear = (date: string) => {
    return date ? date.split("-")[0] : "N/A"
  }

  const getRating = (voteAverage: number) => {
    return Math.round((voteAverage / 2) * 10) / 10
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-5 h-5">
            <Star className="w-5 h-5 text-gray-600 absolute" />
            <div className="overflow-hidden w-1/2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>,
        )
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-600" />)
      }
    }

    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">{getTranslation(language, "loading")}</div>
      </div>
    )
  }

  if (error || !tvSeries) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-xl text-red-500 mb-4">{error || "Serie TV non trovata"}</div>
        <Button onClick={() => router.back()} variant="outline">
          {getTranslation(language, "back")}
        </Button>
      </div>
    )
  }

  const backdropUrl = getBackdropUrl(tvSeries.backdrop_path)
  const rating = getRating(tvSeries.vote_average)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 left-0 z-20 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-white hover:bg-black/70 backdrop-blur-sm bg-black/30 border border-white/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {getTranslation(language, "back")}
        </Button>
      </div>

      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 z-0">
            <Image
              src={backdropUrl || "/placeholder.svg"}
              alt={tvSeries.name}
              fill
              className="object-cover opacity-30"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        )}

        <div className="relative z-10 pt-20 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-shrink-0">
                <Card className="bg-transparent border-0">
                  <CardContent className="p-0">
                    <div className="w-80 aspect-[2/3] relative overflow-hidden rounded-lg shadow-2xl">
                      <Image
                        src={getPosterUrl(tvSeries.poster_path) || "/placeholder.svg"}
                        alt={tvSeries.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2">{tvSeries.name}</h1>
                  <p className="text-xl text-gray-300">
                    {getYear(tvSeries.first_air_date)}
                    {tvSeries.last_air_date &&
                      tvSeries.first_air_date !== tvSeries.last_air_date &&
                      ` - ${getYear(tvSeries.last_air_date)}`}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative z-30">
                      <label className="block text-sm font-medium text-gray-300 mb-2">{getTranslation(language, "season")}</label>
                      <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                        <SelectTrigger className="bg-gray-900 border-2 border-gray-500 text-white hover:border-gray-400 focus:border-red-500 h-12 text-base relative z-30">
                          <SelectValue placeholder={getTranslation(language, "selectSeason")} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-2 border-gray-500 text-white relative z-40">
                          {tvSeries.seasons
                            .filter((season) => season.season_number > 0)
                            .map((season) => (
                              <SelectItem
                                key={season.id}
                                value={season.season_number.toString()}
                                className="hover:bg-gray-700 focus:bg-gray-700 text-white bg-gray-900"
                              >
                                {season.name} ({season.episode_count} {getTranslation(language, "episodes")})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative z-30">
                      <label className="block text-sm font-medium text-gray-300 mb-2">{getTranslation(language, "episode")}</label>
                      <Select
                        value={selectedEpisode}
                        onValueChange={setSelectedEpisode}
                        disabled={!selectedSeason || loadingSeason}
                      >
                        <SelectTrigger className="bg-gray-900 border-2 border-gray-500 text-white hover:border-gray-400 focus:border-red-500 h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed relative z-30">
                          <SelectValue placeholder={loadingSeason ? getTranslation(language, "loading") : getTranslation(language, "selectEpisode")} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-2 border-gray-500 text-white relative z-40">
                          {seasonDetails?.episodes.map((episode) => (
                            <SelectItem
                              key={episode.id}
                              value={episode.episode_number.toString()}
                              className="hover:bg-gray-700 focus:bg-gray-700 text-white bg-gray-900"
                            >
                              Ep. {episode.episode_number}: {episode.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">{renderStars(rating)}</div>
                  <span className="text-lg font-semibold">{rating}/5</span>
                  <span className="text-gray-400">({tvSeries.vote_count.toLocaleString()} {getTranslation(language, "votes")})</span>
                </div>

                {tvSeries.genres && tvSeries.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tvSeries.genres.map((genre) => (
                      <span key={genre.id} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-6 text-gray-300">
                  <span>{tvSeries.number_of_seasons} {getTranslation(language, "seasons")}</span>
                  <span>{tvSeries.number_of_episodes} {getTranslation(language, "episodes")}</span>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-3">{getTranslation(language, "overview")}</h2>
                  <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                    {tvSeries.overview || getTranslation(language, "noAvailableTrama")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}
