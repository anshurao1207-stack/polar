@echo off
echo ========================================================
echo   Starting PolarTwin Antarctic Mission Control System
echo ========================================================

echo [1/3] Checking Backend dependencies...
cd backend
if not exist "installed.flag" (
    echo Installing FastAPI requirements...
    python -m pip install -r requirements.txt
    echo done > installed.flag
)
echo Launching FastAPI Backend on port 8000...
start "PolarTwin Backend" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000"
cd ..

echo [2/3] Checking Frontend dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing frontend packages (first time setup)...
    npm install
)
echo Launching Vite Frontend on port 5173...
start "PolarTwin Frontend" cmd /k "npm run dev -- --host"
cd ..

echo ========================================================
echo   PolarTwin is running!
echo   Local Laptop URL: http://localhost:5173
echo   Phone / LAN URL:  http://localhost:5173
echo   Backend API Docs: http://localhost:8000/docs
echo ========================================================
echo Opening browser in 4 seconds...
timeout /t 4 /nobreak >nul
start http://localhost:5173
pause
