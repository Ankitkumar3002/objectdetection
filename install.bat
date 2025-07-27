@echo off
echo ========================================
echo AI Detection App - Installation Script
echo ========================================
echo.

echo Installing dependencies for all services...
echo.

echo [1/4] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install root dependencies
    pause
    exit /b 1
)

echo [2/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo [3/4] Installing backend dependencies...
cd ..\backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo [4/4] Installing AI service dependencies...
cd ..\ai-service
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install AI service dependencies
    echo Please check Python installation and try again
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Update .env files if needed
echo 3. Run 'npm run dev' to start all services
echo.
echo For detailed setup instructions, see SETUP.md
echo.
pause
