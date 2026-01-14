@echo off
REM AI Book Writer - Easy Startup Script for Windows
REM Double-click this file to start your book writing app!

echo ==========================================
echo   AI Book Writer - Starting...
echo ==========================================
echo.

REM Check if serve is installed
where serve >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing server (one-time setup)...
    call npm install -g serve
    echo.
)

echo Starting your AI Book Writer...
echo The app will open in your browser automatically!
echo.
echo Press Ctrl+C to stop the server when you're done writing.
echo.

REM Start the server
serve -s build -l 3000

pause
