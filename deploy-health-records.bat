@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo    HEALTH RECORDS MANAGEMENT SYSTEM - DEPLOYMENT
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

echo Deploying Health Records Management System...
echo.

echo [1/5] Applying secrets...
kubectl apply -f k8s\secrets.yaml
if %errorlevel% neq 0 (
    echo [ERROR] Failed to apply secrets
    pause
    exit /b 1
)
echo [OK] Secrets applied successfully
echo.

echo [2/5] Applying backend deployment...
kubectl apply -f k8s\backend-deployment.yaml
if %errorlevel% neq 0 (
    echo [ERROR] Failed to apply backend deployment
    pause
    exit /b 1
)
echo [OK] Backend deployment applied successfully
echo.

echo [3/5] Applying backend service...
kubectl apply -f k8s\backend-service.yaml
if %errorlevel% neq 0 (
    echo [ERROR] Failed to apply backend service
    pause
    exit /b 1
)
echo [OK] Backend service applied successfully
echo.

echo [4/5] Applying frontend deployment...
kubectl apply -f k8s\frontend-deployment.yaml
if %errorlevel% neq 0 (
    echo [ERROR] Failed to apply frontend deployment
    pause
    exit /b 1
)
echo [OK] Frontend deployment applied successfully
echo.

echo [5/5] Applying frontend service...
kubectl apply -f k8s\frontend-service.yaml
if %errorlevel% neq 0 (
    echo [ERROR] Failed to apply frontend service
    pause
    exit /b 1
)
echo [OK] Frontend service applied successfully
echo.

echo ==================================================
echo    DEPLOYMENT COMPLETED SUCCESSFULLY
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