# GoodKraken 🦑

A Netflix-like movie/TV shows provider seeking application for movies and TV series built with Next.js, featuring a sleek dark interface and multi-language support.

## Features

- **Movie & TV Series Search**: Search through thousands of movies and TV shows using TMDB API
- **Multi-language Support**: Available in Italian, English, Spanish, French, and German with flag indicators
- **Responsive Design**: Optimized for desktop and mobile devices
- **Season & Episode Selection**: For TV series, choose specific seasons and episodes
- **Real-time Search**: Debounced search with automatic results refresh
- **Dark Theme**: Netflix-inspired dark interface with blue colors

## Screenshots

- **Homepage**: Clean search interface with GoodKraken logo

- **Search Results**: Grid layout showing movie/TV series posters with titles and years

- **Movie Details**: Detailed view with poster, description and ratings

- **TV Series Details**: Season and episode selection


## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **API**: The Movie Database (TMDB) API

## Prerequisites

- Node.js 18+ 
- npm or yarn
- TMDB API key (free registration at [themoviedb.org](https://www.themoviedb.org/))

## Installation (no Docker)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd goodkraken-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   TMDB_API_KEY=your_tmdb_bearer_token_here
   ```
   
   To get your TMDB API token:
   - Register at [themoviedb.org](https://www.themoviedb.org/)
   - Go to Settings > API
   - Copy your "API Read Access Token" (Bearer Token)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Easier installation (with Docker)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd goodkraken-app
   ```

2. **Get TMDB API Key**
   
   Click here to get your key: [themoviedb.org](https://www.themoviedb.org/settings/api)

3. **Run installer**
   ```bash
   ./kraken_install.sh # Linux (or WSL2)
   # or
   ./kraken_install.bat # Windows
   ```

4. **Start the server**
   ```bash
   ./kraken_start.sh # Linux (or WSL2)
   # or
   ./kraken_start.bat # Windows
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)


6. **Use ngrok for tunneling (optional)**

   ```bash
   ./use_ngrok.sh # Linux (or WSL2)
   # or
   ./use_ngrok.bat # Windows
   ```


## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types
- `npm run clean` - Clean build files
- `npm run preview` - Build and start production server
- `npm run dev:turbo` - Start development with Turbo mode
- `npm run analyze` - Analyze bundle size

## How It Works

### Search Flow
1. **Homepage**: Enter search query and select content type (Movie/TV)
2. **Language Selection**: Choose preferred language using flag dropdown
3. **Results Page**: Browse search results in a responsive grid
4. **Details Page**: View detailed information

### Movie Experience
- Click on any movie poster to view details
- See poster, title, description, ratings with star system

### TV Series Experience
- Select TV series from search results
- Choose season from dropdown menu
- Select specific episode

### Language Support
- Interface supports 5 languages: Italian, English, Spanish, French, German
- TMDB API returns content metadata in selected language
- Language preference persists across searches

## Project Structure

```
goodkraken-app/
├── app
│   ├── api
│   │   ├── movie
│   │   │   └── [id]
│   │   │       └── route.ts
│   │   ├── search
│   │   │   └── route.ts
│   │   └── tv
│   │       └── [id]
│   │           ├── route.ts
│   │           └── seasons
│   │               └── route.ts
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── movie
│   │   └── [id]
│   │       ├── loading.tsx
│   │       └── page.tsx
│   ├── page.tsx
│   ├── search
│   │   ├── loading.tsx
│   │   └── page.tsx
│   └── tv
│       └── [id]
│           ├── loading.tsx
│           └── page.tsx
├── components/
│   ├── ui/
│   ├── language-selector.tsx
│   └── theme-provider.tsx
├── lib/
│   ├── translations.ts
│   └── utils.ts
├── public/
│   ├── goodkraken_logo.png
│   └── movie-poster-placeholder.png
└── README.md   <- you are here!
```

## API Integration

### TMDB API Endpoints Used
- `GET /search/movie` - Search movies
- `GET /search/tv` - Search TV series  
- `GET /movie/{id}` - Movie details
- `GET /tv/{id}` - TV series details
- `GET /tv/{id}/season/{season}` - Season details with episodes

### Streaming Integration
- Movies: `https://vixsrc.to/movie/{tmdb_id}`
- TV Series: `https://vixsrc.to/tv/{tmdb_id}/{season}/{episode}`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is for educational purposes. Please respect TMDB's terms of service and ensure you have proper licensing for any streaming content.

## Troubleshooting

### Common Issues

**API Token Issues**
- Ensure TMDB_API_KEY is correctly set in `.env.local`
- Verify the token is a Bearer token, not API key
- Check token permissions in TMDB settings

**Search Not Working**
- Check network connectivity
- Verify TMDB API status
- Check browser console for errors

**Video Not Loading**
- Streaming depends on vixsrc.to availability
- Some content may not be available
- Try different movies/episodes

**Build Errors**
- Run `npm run clean` and reinstall dependencies
- Check Node.js version (18+ required)
- Verify all environment variables are set

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error messages and browser console logs

---

Built with ❤️ using Next.js and TMDB API
