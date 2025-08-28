import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const tvId = params.id
  const searchParams = request.nextUrl.searchParams
  const language = searchParams.get("lang") || "it-IT"
  const region = language.split("-")[1] || "IT" // es. "it-IT" -> "IT"

  if (!tvId) {
    return NextResponse.json({ error: "TV series ID is required" }, { status: 400 })
  }

  const tmdbApiKey = process.env.TMDB_API_KEY
  const rapidApiKey = process.env.RAPIDAPI_KEY

  if (!tmdbApiKey) {
    console.error("TMDB_API_KEY is not configured")
    return NextResponse.json({ error: "API configuration error" }, { status: 500 })
  }

  try {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?language=${language}`, {
      headers: {
        Authorization: `Bearer ${tmdbApiKey}`,
        accept: "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 429) {
        console.error("TMDB API rate limit exceeded")
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
      }
      if (response.status === 404) {
        return NextResponse.json({ error: "TV series not found" }, { status: 404 })
      }
      console.error(`TMDB API error: ${response.status}`)
      return NextResponse.json({ error: "Failed to fetch TV series details" }, { status: response.status })
    }

    const data = await response.json()
    console.log(`[v0] TV show details fetched successfully for: ${data.name}`)

    const providersResponse = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/watch/providers`, {
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
      const externalIdsResponse = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/external_ids`, {
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
      ...data,
      providers,
      externalLinks,
    })
  } catch (error) {
    console.error("TV series API error:", error)
    return NextResponse.json({ error: "Failed to fetch TV series details" }, { status: 500 })
  }
}
