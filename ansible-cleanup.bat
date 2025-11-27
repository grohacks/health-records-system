@echo off
echo Starting Ansible-like cleanup...
echo.

echo Deleting Kubernetes resources...
echo.

echo 1. Deleting frontend service...
kubectl delete -f k8s\frontend-service.yaml
echo.

echo 2. Deleting frontend deployment...
kubectl delete -f k8s\frontend-deployment.yaml
echo.

echo 3. Deleting backend service...
kubectl delete -f k8s\backend-service.yaml
echo.

echo 4. Deleting backend deployment...
kubectl delete -f k8s\backend-deployment.yaml
echo.

echo 5. Deleting secrets...
kubectl delete -f k8s\secrets.yaml
echo.

echo Cleanup completed!
echo.
echo Current status:
kubectl get deployments,services
echo.
pause