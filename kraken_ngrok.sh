#!/bin/bash


if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# check if $NGROK_AUTH_TOKEN is set in .env.local
if [ -z "$NGROK_AUTH_TOKEN" ]; then
  echo "NGROK_AUTH_TOKEN is not set in .env.local. Please set it before running this script or run kraken_ngrok_no_token.sh"
  exit 1
fi

ngrok http 3000 --authtoken $NGROK_AUTH_TOKEN --log=stdout