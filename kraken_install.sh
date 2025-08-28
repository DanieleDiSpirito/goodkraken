#!/bin/bash

read -p "Is .env.local present? [Y/n]" choice

if [[ "$choice" == "n" || "$choice" == "N" ]]; then
    touch .env.local
    echo "TMDb API Key - Get it from https://www.themoviedb.org/settings/api"
    # input of api_key and ngrok token
    read -p "Enter your TMDb API Key: " api_key
    echo "TMDB_API_KEY=$api_key" > .env.local
    echo "TMDB API Key is saved in .env.local"

    echo "(OPTIONAL BUT SUGGESTED) RapidAPI Key for Links - Get it sign in from https://rapidapi.com/auth/login [just press enter to skip]"
    read -p "Enter your RapidAPI Key: " rapidapi_key
    echo "RAPIDAPI_KEY=$rapidapi_key" >> .env.local
    echo "RapidAPI Key is saved in .env.local"

    echo "(OPTIONAL!!!) NGROK AUTH Token - Get it from https://dashboard.ngrok.com/get-started/your-authtoken [just press enter to skip]"
    read -p "Enter your Ngrok Auth Token: " ngrok_token
    echo "NGROK_AUTH_TOKEN=$ngrok_token" >> .env.local
    echo "NGROK AUTH Token is saved in .env.local"    
fi

echo "Starting Docker build..."
docker-compose build --no-cache
echo "Docker build completed."
echo "You can now run the application using 'docker-compose up' or just ./kraken_start.sh"
echo "If you want tunneling using ngrok just run ./kraken_ngrok.sh"