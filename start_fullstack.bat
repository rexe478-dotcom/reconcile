@echo off
title Reconcile Full-Stack Dev Server
echo ========================================================
echo   Starting Reconcile Full-Stack Application
echo   - Backend API: http://localhost:8000 (Docs: /docs)
echo   - Web PWA:     http://localhost:3000
echo ========================================================

echo Launching FastAPI Backend...
start "Reconcile Backend" cmd /k "cd /d %~dp0reconcile_backend && .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo Launching React/Vite Frontend...
start "Reconcile Frontend" cmd /k "cd /d %~dp0reconcile_web && npm run dev"

timeout /t 2 /nobreak >nul
start http://localhost:3000
