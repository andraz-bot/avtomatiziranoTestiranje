@echo off
set PLAYWRIGHT_DOTENV_QUIET=1
set DOTENV_QUIET=1
set NODE_NO_WARNINGS=1
setlocal enabledelayedexpansion
:: Nastavi kodiranje na UTF-8 za pravilne šumnike
chcp 65001 > nul
title PIS-UA Avtomatizacija
cd /d "%~dp0"

cls
echo ============================================================
echo        PIS-UA AVTOMATIZIRANO TESTIRANJE: ZAGON
echo ============================================================
echo.

:: --- PREVERJANJE IN NAMESTITEV ---
if not exist node_modules (
    echo [ SISTEM ] Knjižnice niso najdene. Nameščam...
    call npm install
    call npm install dotenv
    echo [ SISTEM ] Nameščam brskalnike...
    call npx playwright install chromium
)

echo [1/3] Čiščenje...
if exist rezultati.txt del /f /q rezultati.txt > nul 2>&1

echo [2/3] Izvajanje testov (Playwright)...
echo ------------------------------------------------------------
set "FORCE_COLOR=0"
set "PLAYWRIGHT_NO_COLOR=1"
call npx playwright test --headed --reporter=list
echo ------------------------------------------------------------

echo.
echo [3/3] Generiranje poročil...
node utils/reportGenerator.js

echo.
echo ============================================================
echo    POSTOPEK KONČAN.
echo    Poročila so v mapi reports.
echo ============================================================
echo.

echo Za izhod pritisni poljubno tipko...
pause > nul
exit