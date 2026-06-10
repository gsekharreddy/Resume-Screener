@echo off
title AI Resume Screener Runner

:: Check if node_modules exists in backend
if not exist "backend\node_modules\" (
    echo [1/2] Installing backend dependencies...
    call npm run setup
) else (
    echo [1/2] Dependencies already installed.
)

echo.
echo [2/2] Starting backend Express server...
echo Access the application at: http://localhost:5000
echo.
call npm start
pause
