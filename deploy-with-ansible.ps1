# PowerShell script to deploy Kubernetes manifests (Ansible-like behavior)

Write-Host "Starting deployment process..." -ForegroundColor Green

# Apply secrets
Write-Host "Applying secrets..." -ForegroundColor Yellow
kubectl apply -f k8s/secrets.yaml

# Apply backend deployment
Write-Host "Applying backend deployment..." -ForegroundColor Yellow
kubectl apply -f k8s/backend-deployment.yaml

# Apply backend service
Write-Host "Applying backend service..." -ForegroundColor Yellow
kubectl apply -f k8s/backend-service.yaml

# Apply frontend deployment
Write-Host "Applying frontend deployment..." -ForegroundColor Yellow
kubectl apply -f k8s/frontend-deployment.yaml

# Apply frontend service
Write-Host "Applying frontend service..." -ForegroundColor Yellow
kubectl apply -f k8s/frontend-service.yaml

Write-Host "Deployment completed successfully!" -ForegroundColor Green

# Show status
Write-Host "`nCurrent status:" -ForegroundColor Cyan
kubectl get deployments,services