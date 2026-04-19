@echo off
title Push Adak Enterprise to GitHub
color 0B
echo.
echo ============================================================
echo   Pushing code to GitHub...
echo   Repository: https://github.com/sayak-code/AdakEnterprise
echo ============================================================
echo.

cd /d "%~dp0"

:: Check if git exists
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed on this computer!
    echo Please install Git from https://git-scm.com/ to proceed.
    pause
    exit /b
)

:: Initialize git if not already
if not exist ".git" (
    echo [INFO] Initializing new Git repository...
    git init
    git branch -M main
)

:: Set local git identity if not set globally
git config user.name "sayak"
git config user.email "sayak@github.local"

:: Set the remote repository URL
echo [INFO] Connecting to GitHub repository...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/sayak-code/AdakEnterprise.git

:: Add files and commit
echo [INFO] Adding files...
git add .
echo [INFO] Committing changes...
git commit -m "Initial commit: Adak Enterprise Tathya Mitra Kendra project with full admin panel and JSON backend"

:: Push to GitHub
echo [INFO] Uploading to GitHub...
git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ============================================================
    echo   [SUCCESS] Code successfully pushed to GitHub!
    echo   URL: https://github.com/sayak-code/AdakEnterprise
    echo ============================================================
) else (
    echo ============================================================
    echo   [ERROR] Failed to push to GitHub. 
    echo   Please make sure the repository exists and you are logged into Git.
    echo ============================================================
)
echo.
pause
