@echo off
setlocal
cd /d "%~dp0"
title StarSprout Clean Start

echo This build uses a new port and clears its own web cache.
echo Starting V2.8.1 from-zero build...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start_server.ps1"

if errorlevel 1 (
  echo.
  echo Startup failed. Please take a screenshot of this window.
  echo.
  pause
)
