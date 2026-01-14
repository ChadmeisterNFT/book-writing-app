#!/bin/bash

# AI Book Writer - Easy Startup Script
# Double-click this file to start your book writing app!

echo "=========================================="
echo "  AI Book Writer - Starting..."
echo "=========================================="
echo ""

# Check if serve is installed
if ! command -v serve &> /dev/null; then
    echo "Installing server (one-time setup)..."
    npm install -g serve
    echo ""
fi

echo "Starting your AI Book Writer..."
echo "The app will open in your browser automatically!"
echo ""
echo "Press Ctrl+C to stop the server when you're done writing."
echo ""

# Start the server and open browser
serve -s build -l 3000

# Keep terminal open if there's an error
read -p "Press Enter to exit..."
