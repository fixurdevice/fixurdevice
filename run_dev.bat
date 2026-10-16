@echo off
title FixUrDevice - Launch Full Stack (Backend + Frontend)
echo ========================================================
echo   Launching FixUrDevice Full Stack Development Servers
echo ========================================================
start "FixUrDevice Backend (Port 8000)" cmd /k "cd /d "%~dp0backend" && python manage.py runserver 127.0.0.1:8000"
timeout /t 3 /nobreak >nul
start "FixUrDevice Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo Both servers launched!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
