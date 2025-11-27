@echo off
echo Starting Health Records Management System...

echo 1. Starting Docker Desktop (if not already running)...
echo Please ensure Docker Desktop is running with Kubernetes enabled
timeout /t 5 >nul

echo 2. Checking Kubernetes connectivity...
:retry
kubectl cluster-info >nul 2>&1
if %errorlevel% neq 0 (
    echo    Kubernetes not ready, waiting 10 seconds...
    timeout /t 10 >nul
    goto retry
)

echo 3. Deploying applications...
call deploy-health-records.bat

echo.
echo ==================================================
echo    HEALTH RECORDS MANAGEMENT SYSTEM IS READY
echo ==================================================
echo Frontend: http://localhost:30485
echo Backend:  http://localhost:30980/api/
echo.
echo Press any key to exit...
pause >nul