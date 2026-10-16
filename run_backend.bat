@echo off
title FixUrDevice - Django Backend Server
cd /d "%~dp0backend"
echo ========================================================
echo   Starting FixUrDevice Django Backend on Port 8000...
echo ========================================================
python manage.py runserver 127.0.0.1:8000
pause
