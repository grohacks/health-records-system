@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo    HEALTH RECORDS MANAGEMENT SYSTEM - CLEANUP
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

echo Cleaning up Health Records Management System...
echo.

echo [1/5] Deleting frontend service...
kubectl delete -f k8s\frontend-service.yaml
if %errorlevel% neq 0 (
    echo [WARNING] Failed to delete frontend service (may not exist)
)
echo [OK] Frontend service deletion attempted
echo.

echo [2/5] Deleting frontend deployment...
kubectl delete -f k8s\frontend-deployment.yaml
if %errorlevel% neq 0 (
    echo [WARNING] Failed to delete frontend deployment (may not exist)
)
echo [OK] Frontend deployment deletion attempted
echo.

echo [3/5] Deleting backend service...
kubectl delete -f k8s\backend-service.yaml
if %errorlevel% neq 0 (
    echo [WARNING] Failed to delete backend service (may not exist)
)
echo [OK] Backend service deletion attempted
echo.

echo [4/5] Deleting backend deployment...
kubectl delete -f k8s\backend-deployment.yaml
if %errorlevel% neq 0 (
    echo [WARNING] Failed to delete backend deployment (may not exist)
)
echo [OK] Backend deployment deletion attempted
echo.

echo [5/5] Deleting secrets...
kubectl delete -f k8s\secrets.yaml
if %errorlevel% neq 0 (
    echo [WARNING] Failed to delete secrets (may not exist)
)
echo [OK] Secrets deletion attempted
echo.

echo ==================================================
echo    CLEANUP COMPLETED
echo ==================================================
echo.

echo Current status:
echo --------------------------------------------------
kubectl get deployments,services -o wide
echo.

echo Press any key to exit...
pause >nul