@echo off
title Adak Enterprise – Tathya Mitra Kendra Server
color 0A
echo.
echo ============================================================
echo   Adak Enterprise – Tathya Mitra Kendra
echo   Installing Dependencies and Starting server...
echo ============================================================
echo.

cd /d "%~dp0"

echo [INFO] Ensuring all packages are fully installed...
echo        Please wait while npm install runs...
echo.
call npm install
echo.
echo [OK] Dependencies installed!
echo.

echo [OK] Starting server on http://localhost:3000
echo.
echo   Public Website : http://localhost:3000
echo   Admin Panel    : http://localhost:3000/admin/login.html
echo   API Health     : http://localhost:3000/api/health
echo.
echo [Credentials] admin / AdakAdmin@2024
echo.
echo Press Ctrl+C to stop the server.
echo ============================================================
echo.

:: Start the server
node server.js

pause
