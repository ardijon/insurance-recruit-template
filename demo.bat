@echo off
echo.
echo ========================================
echo   Insurance Demo - Demo Mode Setup
echo ========================================
echo.
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0demo-setup.ps1"
pause
