@echo off
title Reconcile Web App
echo ========================================================
echo   Starting Reconcile Web Application (http://localhost:3000)
echo ========================================================
cd /d "%~dp0reconcile_web"
start http://localhost:3000
npm run dev
pause
