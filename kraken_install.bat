@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

set /p choice=Is .env.local present? [Y/n] 

if /I "%choice%"=="n" (
    echo Creating .env.local...
    type nul > .env.local

    echo TMDb API Key - Get it from https://www.themoviedb.org/settings/api
    set /p api_key=Enter your TMDb API Key: 
    echo TMDB_API_KEY=%api_key%> .env.local
    echo TMDB API Key is saved in .env.local

    echo (OPTIONAL BUT SUGGESTED) RapidAPI Key for Links - Get it sign in from https://rapidapi.com/auth/login [just press enter to skip]
    set /p rapidapi_key=Enter your RapidAPI Key:
    echo RAPIDAPI_KEY=%rapidapi_key%>> .env.local
    echo RapidAPI Key is saved in .env.local

    echo (OPTIONAL!!!) NGROK AUTH Token - Get it from https://dashboard.ngrok.com/get-started/your-authtoken [just press enter to skip]
    set /p ngrok_token=Enter your Ngrok Auth Token: 
    echo NGROK_AUTH_TOKEN=%ngrok_token%>> .env.local
    echo NGROK AUTH Token is saved in .env.local
)

echo Starting Docker build...
docker-compose build --no-cache
echo Docker build completed.
echo You can now run the application using 'docker-compose up' or just kraken_start.bat
echo If you want tunneling using ngrok just run kraken_ngrok.bat
pause
