"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Play, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { LanguageSelector, getApiLanguageCode } from "@/components/language-selector"
import { getTranslation } from "@/lib/translations"
import { useLanguage } from "@/hooks/use-language"
import type { Language } from "@/lib/translations"


interface MovieDetails {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  overview: string
  vote_average: number
  vote_count: number
  runtime: number
  genres: { id: number; name: string }[]
}

export default function MovieDetailsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const movieId = params.id as string
  const languageReq = searchParams.get("lang") || "it-IT"
  const { language, setLanguage } = useLanguage()
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
  const fetchMovieDetails = async () => {
    if (!movieId) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/movie/${movieId}?lang=${languageReq}`)

      if (!response.ok) {
        if (response.status !== 429) {
          throw new Error(getTranslation(language, "noResultsFound"))
        }
      }

      const data: MovieDetails = await response.json()
      setMovie(data)
    } catch (err: any) {
      if (err.name === "AbortError") {
        return
      }
      setError(err.message || "Errore nel caricamento del film")
      console.error("Movie fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  fetchMovieDetails()
}, [movieId, language])

  const getPosterUrl = (posterPath: string | null) => {
    return posterPath ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${posterPath}` : "/movie-poster-placeholder.png"
  }

  const getBackdropUrl = (backdropPath: string | null) => {
    return backdropPath ? `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${backdropPath}` : null
  }

  const getYear = (releaseDate: string) => {
    return releaseDate ? releaseDate.split("-")[0] : "N/A"
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

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-xl text-red-500 mb-4">{error || "Film non trovato"}</div>
        <Button onClick={() => router.back()} variant="outline">
          {getTranslation(language, "back")}
        </Button>
      </div>
    )
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path)
  const rating = getRating(movie.vote_average)

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
              alt={movie.title}
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
                        src={getPosterUrl(movie.poster_path) || "/placeholder.svg"}
                        alt={movie.title}
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
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2">{movie.title}</h1>
                  <p className="text-xl text-gray-300">{getYear(movie.release_date)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">{renderStars(rating)}</div>
                  <span className="text-lg font-semibold">{rating}/5</span>
                  <span className="text-gray-400">({movie.vote_count.toLocaleString()} {getTranslation(language, "votes")})</span>
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span key={genre.id} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {movie.runtime && (
                  <p className="text-gray-300">
                    {getTranslation(language, "duration")}: {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </p>
                )}

                <div>
                  <h2 className="text-2xl font-semibold mb-3">{getTranslation(language, "overview")}</h2>
                  <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                    {movie.overview || getTranslation(language, "noAvailableTrama")}
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
