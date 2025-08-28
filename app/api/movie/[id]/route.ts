import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const movieId = params.id
    const searchParams = request.nextUrl.searchParams
    const language = searchParams.get("lang") || "it-IT"

    const tmdbApiKey = process.env.TMDB_API_KEY
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

    return NextResponse.json(movieData)
  } catch (error) {
    console.error("[v0] Movie API error:", error)
    return NextResponse.json({ error: "Failed to fetch movie details" }, { status: 500 })
  }
}
