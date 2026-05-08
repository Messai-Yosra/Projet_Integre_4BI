@echo off
title AppPI - Startup
color 0A

echo ============================================
echo   AppPI - Padel Platform Startup
echo ============================================
echo.

:: Check if XAMPP MySQL is running
echo [1/3] Checking MySQL (XAMPP)...
"C:\xampp\mysql\bin\mysql.exe" -u root -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo  MySQL not running. Starting XAMPP MySQL...
    start "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini"
    timeout /t 4 /nobreak >nul
    echo  MySQL started.
) else (
    echo  MySQL is already running.
)

:: Kill any previous instances
echo.
echo [2/3] Starting Flask Backend (port 5000)...
taskkill /f /im python.exe >nul 2>&1
timeout /t 1 /nobreak >nul
start "Flask Backend" cmd /k "cd /d C:\Users\wisse\Desktop\AppPI\BackEnd && python run.py"

:: Wait for backend to be ready
timeout /t 4 /nobreak >nul

:: Start Angular frontend
echo.
echo [3/3] Starting Angular Frontend (port 4200)...
start "Angular Frontend" cmd /k "cd /d C:\Users\wisse\Desktop\AppPI\FrontEnd && ng serve --open"

echo.
echo ============================================
echo   Both servers are starting!
echo.
echo   Backend  : http://localhost:5000
echo   Frontend : http://localhost:4200
echo.
echo   Login: admin / admin123
echo ============================================
echo.
echo (This window can be closed)
pause
