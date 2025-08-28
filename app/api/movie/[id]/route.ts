import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const movieId = params.id
    const searchParams = request.nextUrl.searchParams
    const language = searchParams.get("lang") || "it-IT"
    const region = language.split("-")[1] || "IT" // es. "it-IT" -> "IT"

    const tmdbApiKey = process.env.TMDB_API_KEY
    const rapidApiKey = process.env.RAPIDAPI_KEY
    
    if (!tmdbApiKey) {
      return NextResponse.json({ error: "TMDB API token not configured" }, { status: 500 })
    }

    console.log(`[v0] Fetching movie details for ID: ${movieId}, language: ${language}`)

    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=${language}`, {
      headers: {
        Authorization: `Bearer ${tmdbApiKey}`,
        accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
      }

      if (response.status === 404) {
        return NextResponse.json({ error: "Movie not found" }, { status: 404 })
      }

      throw new Error(`TMDB API error: ${response.status}`)
    }

    const movieData = await response.json()
    console.log(`[v0] Movie details fetched successfully for: ${movieData.title}`)

    const providersResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers`, {
      headers: {
        Authorization: `Bearer ${tmdbApiKey}`,
        accept: "application/json",
      },
    })
    const providersData = await providersResponse.json()
    const providers = providersData.results?.[region] || {}

    let imdbId = null
    let externalLinks = []

    try {
      const externalIdsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/external_ids`, {
        headers: {
          Authorization: `Bearer ${tmdbApiKey}`,
          accept: "application/json",
        },
      })
      
      if (externalIdsResponse.ok) {
        const externalData = await externalIdsResponse.json()
        imdbId = externalData.imdb_id
        console.log(`[v0] IMDb ID found: ${imdbId}`)
      }
    } catch (error) {
      console.warn("[v0] Failed to fetch external IDs:", error)
    }

    if (imdbId) {
      try {
        const rapidApiResponse = await fetch(`https://film-show-ratings.p.rapidapi.com/item/?id=${imdbId}`, {
          headers: {
            'x-rapidapi-host': 'film-show-ratings.p.rapidapi.com',
            'x-rapidapi-key': rapidApiKey || '',
            'Accept-Encoding': 'identity',
          },
        })
        
        if (rapidApiResponse.ok) {
          const rapidData = await rapidApiResponse.json()
          externalLinks = rapidData.result?.links || []
          console.log(externalLinks)
          if (externalLinks) {
            externalLinks = Object.entries(externalLinks).map(([provider, url]) => ({
              provider,
              url,
            }))
          }
          console.log(`[v0] External links found: ${externalLinks.length}`)
        }
      } catch (error) {
        console.warn("[v0] Failed to fetch external links:", error)
      }
    }

    return NextResponse.json({
      ...movieData,
      providers,
      externalLinks,
    })
  } catch (error) {
    console.error("[v0] Movie API error:", error)
    return NextResponse.json({ error: "Failed to fetch movie details" }, { status: 500 })
  }
}
