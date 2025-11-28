# Health Records Management System - Workflow Instructions

## Overview
This document explains the complete workflow for developing and deploying the Health Records Management System.

## Initial Setup

1. **Start Docker Desktop**
   - Launch Docker Desktop
   - Ensure Kubernetes is enabled (Settings → Kubernetes → Enable Kubernetes)
   - Wait for Docker Desktop to fully start

2. **Deploy the Application**
   ```cmd
   .\deploy-health-records.bat
   ```

3. **Access the Applications**
   - Frontend: http://localhost:30485
   - Backend API: http://localhost:30980/api/

## Development Workflow

### 1. Make Code Changes
- Modify files in the backend or frontend directories
- Test locally if needed

### 2. Commit and Push to GitHub
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### 3. GitHub Actions Process
- GitHub Actions automatically builds Docker images
- Images are pushed to Docker Hub with two tags:
  - Commit SHA (e.g., `grohacks/health-records-backend:a1b2c3d`)
  - `latest` tag

### 4. Update Local Kubernetes
After GitHub Actions completes:
```cmd
.\update-from-dockerhub.bat
```

This script will:
- Pull the latest images from Docker Hub
- Update Kubernetes deployments to use the new images
- Kubernetes automatically rolls out the updates

### 5. Verify Updates
- Refresh your browser to see the updated application
- Frontend: http://localhost:30485
- Backend API: http://localhost:30980/api/

## Scripts Summary

### `deploy-health-records.bat`
- Used for initial deployment
- Applies all Kubernetes manifests from the `k8s/` directory
- Use after system restart or clean setup

### `update-from-dockerhub.bat`
- Used to update existing deployments with latest images from Docker Hub
- Pulls latest images and updates Kubernetes deployments
- Use after GitHub Actions completes

### `cleanup-health-records.bat`
- Removes all Kubernetes resources
- Use when you want to completely clean up

### `start-system.bat`
- Comprehensive script that checks Kubernetes connectivity and deploys
- Use after system restart

## Docker Hub Integration

The system is configured to use images from Docker Hub:
- Backend: `grohacks/health-records-backend:latest`
- Frontend: `grohacks/health-records-frontend:latest`

To use your own Docker Hub repository:
1. Update the image names in:
   - `k8s/backend-deployment.yaml`
   - `k8s/frontend-deployment.yaml`
2. Update the GitHub Actions workflow in `.github/workflows/ci.yml` to use your Docker Hub username
3. Set up the `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets in your GitHub repository

## Troubleshooting

### If images are not updating:
1. Ensure GitHub Actions completed successfully
2. Run `.\update-from-dockerhub.bat` manually
3. Check Kubernetes deployment status:
   ```cmd
   kubectl get deployments
   ```

### If applications are not accessible:
1. Check if Docker Desktop and Kubernetes are running
2. Verify services are running:
   ```cmd
   kubectl get services
   ```
3. Check pod status:
   ```cmd
   kubectl get pods
   ```