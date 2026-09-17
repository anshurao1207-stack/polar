@echo off
echo ========================================================
echo   Starting PolarTwin Antarctic Mission Control System
echo ========================================================

echo [1/2] Launching FastAPI Backend on port 8000...
start "PolarTwin Backend" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [2/2] Launching Vite Frontend on port 5173...
start "PolarTwin Frontend" cmd /k "cd frontend && npm run dev -- --host"

echo ========================================================
echo   PolarTwin is running!
echo   Local Laptop URL: http://localhost:5173
echo   Phone / LAN URL:  http://192.168.0.101:5173
echo   Backend API Docs: http://localhost:8000/docs
echo ========================================================
pause
