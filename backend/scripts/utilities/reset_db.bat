@echo off
REM Reset Database - Windows Batch Script
REM Usage: reset_db.bat

echo.
echo ================================================
echo   Database Reset Tool
echo ================================================
echo.

cd /d "%~dp0\..\..\"

if exist .venv\Scripts\python.exe (
    echo Using virtual environment Python...
    .venv\Scripts\python.exe scripts\utilities\reset_database.py
) else (
    echo Virtual environment not found, using system Python...
    python scripts\utilities\reset_database.py
)

pause
