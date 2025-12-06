@echo off
echo ========================================
echo Zero Phish Extension - Quick Setup
echo ========================================
echo.

echo [1/3] Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Starting backend server...
echo.
echo Backend will start on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
start cmd /k "node server.js"

echo.
echo [3/3] Opening Chrome Extensions page...
timeout /t 2 /nobreak >nul
start chrome://extensions/

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Enable 'Developer mode' in Chrome
echo 2. Click 'Load unpacked'
echo 3. Select the 'extension' folder
echo 4. Click the Zero Phish icon to test
echo.
echo Backend is running in a separate window
echo ========================================
pause
