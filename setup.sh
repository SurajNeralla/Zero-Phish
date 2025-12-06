#!/bin/bash

echo "========================================"
echo "Zero Phish Extension - Quick Setup"
echo "========================================"
echo ""

echo "[1/3] Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "[2/3] Starting backend server..."
echo ""
echo "Backend will start on http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# Start server in background
node server.js &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

echo ""
echo "[3/3] Opening Chrome Extensions page..."
sleep 2

# Try to open Chrome extensions page
if command -v google-chrome &> /dev/null; then
    google-chrome chrome://extensions/ &
elif command -v chromium &> /dev/null; then
    chromium chrome://extensions/ &
elif command -v open &> /dev/null; then
    # macOS
    open -a "Google Chrome" chrome://extensions/
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next Steps:"
echo "1. Enable 'Developer mode' in Chrome"
echo "2. Click 'Load unpacked'"
echo "3. Select the 'extension' folder"
echo "4. Click the Zero Phish icon to test"
echo ""
echo "Backend is running (PID: $SERVER_PID)"
echo "To stop: kill $SERVER_PID"
echo "========================================"
