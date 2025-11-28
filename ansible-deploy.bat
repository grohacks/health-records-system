@echo off
echo Starting Ansible-like deployment...
echo.

echo Applying Kubernetes manifests...
echo.

echo 1. Applying secrets...
kubectl apply -f k8s\secrets.yaml
echo.

echo 2. Applying backend deployment...
kubectl apply -f k8s\backend-deployment.yaml
echo.

echo 3. Applying backend service...
kubectl apply -f k8s\backend-service.yaml
echo.

echo 4. Applying frontend deployment...
kubectl apply -f k8s\frontend-deployment.yaml
echo.

echo 5. Applying frontend service...
kubectl apply -f k8s\frontend-service.yaml
echo.

echo Deployment completed!
echo.
echo Current status:
kubectl get deployments,services
echo.
pause