@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

rem Load variables from .env.local
for /f "usebackq tokens=1,2 delims==" %%A in (`type .env.local ^| find "="`) do (
    set "%%A=%%B"
)

rem Check if NGROK_AUTH_TOKEN is set
if "%NGROK_AUTH_TOKEN%"=="" (
    echo NGROK_AUTH_TOKEN is not set in .env.local.
    echo Please set it before running this script or run kraken_ngrok_no_token.bat
    pause
    exit /b 1
)

ngrok http 3000 --authtoken %NGROK_AUTH_TOKEN% --log=stdout
