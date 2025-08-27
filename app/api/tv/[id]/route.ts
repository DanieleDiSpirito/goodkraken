import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const tvId = params.id
  const searchParams = request.nextUrl.searchParams
  const language = searchParams.get("lang") || "it-IT"

  if (!tvId) {
    return NextResponse.json({ error: "TV series ID is required" }, { status: 400 })
  }

  const tmdbApiKey = process.env.TMDB_API_KEY

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
    return NextResponse.json(data)
  } catch (error) {
    console.error("TV series API error:", error)
    return NextResponse.json({ error: "Failed to fetch TV series details" }, { status: 500 })
  }
}
