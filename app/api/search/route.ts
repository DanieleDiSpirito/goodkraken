import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")
  const type = searchParams.get("type") || "movie" // Added type parameter with default to movie
  const language = searchParams.get("lang") || "it-IT" // Added language parameter support

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  if (type !== "movie" && type !== "tv") {
    return NextResponse.json({ error: "Type must be 'movie' or 'tv'" }, { status: 400 })
  }

  const tmdbApiKey = process.env.TMDB_API_KEY

  if (!tmdbApiKey) {
    console.error("TMDB_API_KEY is not configured")
    return NextResponse.json({ error: "API configuration error" }, { status: 500 })
  }

  try {
    const endpoint = type === "movie" ? "search/movie" : "search/tv"
    const response = await fetch(
      `https://api.themoviedb.org/3/${endpoint}?query=${encodeURIComponent(query)}&include_adult=false&language=${language}&page=1`,
      {
        headers: {
          Authorization: `Bearer ${tmdbApiKey}`,
          accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      if (response.status === 429) {
        console.error("TMDB API rate limit exceeded")
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
      }
      console.error(`TMDB API error: ${response.status}`)
      return NextResponse.json({ error: "Search failed" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
