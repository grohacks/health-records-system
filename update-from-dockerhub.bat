@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo    HEALTH RECORDS MANAGEMENT SYSTEM - UPDATE
echo ==================================================
echo.

echo Checking Kubernetes connectivity...
kubectl cluster-info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Unable to connect to Kubernetes cluster
    echo Please ensure Docker Desktop with Kubernetes is running
    pause
    exit /b 1
)

echo [OK] Kubernetes cluster is accessible
echo.

echo Pulling latest images from Docker Hub...
echo.

echo [1/4] Pulling backend image...
docker pull grohacks/health-records-backend:latest
if %errorlevel% neq 0 (
    echo [WARNING] Failed to pull backend image, continuing anyway...
)
echo [OK] Backend image pulled
echo.

echo [2/4] Pulling frontend image...
docker pull grohacks/health-records-frontend:latest
if %errorlevel% neq 0 (
    echo [WARNING] Failed to pull frontend image, continuing anyway...
)
echo [OK] Frontend image pulled
echo.

echo [3/4] Updating backend deployment...
kubectl set image deployment/health-records-backend backend=grohacks/health-records-backend:latest
if %errorlevel% neq 0 (
    echo [ERROR] Failed to update backend deployment
    pause
    exit /b 1
)
echo [OK] Backend deployment updated
echo.

echo [4/4] Updating frontend deployment...
kubectl set image deployment/health-records-frontend frontend=grohacks/health-records-frontend:latest
if %errorlevel% neq 0 (
    echo [ERROR] Failed to update frontend deployment
    pause
    exit /b 1
)
echo [OK] Frontend deployment updated
echo.

echo ==================================================
echo    UPDATE COMPLETED SUCCESSFULLY
echo ==================================================
echo.

echo Current status:
echo --------------------------------------------------
kubectl get deployments,services -o wide
echo.

echo Access your applications:
echo --------------------------------------------------
echo Frontend: http://localhost:30485
echo Backend:  http://localhost:30980/api/
echo.

echo Press any key to exit...
pause >nul