# Health Records Management System - DevOps Pipeline

This repository contains a complete DevOps pipeline for the Health Records Management System, including Docker configuration, Kubernetes manifests, GitHub Actions CI/CD pipeline, and deployment automation.

## Prerequisites

- Docker Desktop with Kubernetes enabled
- Node.js 18+
- Java 17+
- Maven
- Python 3.11+ (for Ansible - if using Windows, Python 3.13 may cause compatibility issues)

## Components

### 1. Docker Configuration
- `Dockerfile` - Backend Spring Boot application
- `frontend/Dockerfile` - Frontend React application

### 2. Kubernetes Manifests
- `k8s/backend-deployment.yaml` - Backend deployment
- `k8s/backend-service.yaml` - Backend service (NodePort 30980)
- `k8s/frontend-deployment.yaml` - Frontend deployment
- `k8s/frontend-service.yaml` - Frontend service (NodePort 30485)
- `k8s/secrets.yaml` - Database credentials (base64 encoded)

### 3. GitHub Actions CI/CD
- `.github/workflows/ci.yml` - Complete CI/CD pipeline that:
  - Builds backend and frontend Docker images
  - Pushes images to Docker Hub
  - Does NOT directly deploy to Kubernetes (for security)

### 4. Automation Scripts (Windows Compatible)
- `deploy-health-records.bat` - Deploys all Kubernetes manifests (initial setup)
- `update-from-dockerhub.bat` - Updates Kubernetes to use latest images from Docker Hub
- `cleanup-health-records.bat` - Cleans up all Kubernetes resources

## Usage

### Local Development Workflow

#### Initial Setup (After System Restart):
1. **Start Docker Desktop** with Kubernetes enabled
2. **Deploy the application** using the batch script:
   ```
   .\deploy-health-records.bat
   ```
3. **Access the applications**:
   - Frontend: http://localhost:30485
   - Backend API: http://localhost:30980/api/

#### Code Update Workflow:
1. **Make code changes** and push to GitHub
2. **GitHub Actions** automatically builds and pushes new images to Docker Hub
3. **Update your local Kubernetes** to use the new images:
   ```
   .\update-from-dockerhub.bat
   ```
4. **Your applications** automatically show the updated code

#### Clean Up Resources:
```
.\cleanup-health-records.bat
```

### GitHub Actions Workflow

1. **Set up secrets** in your GitHub repository:
   - `DOCKER_USERNAME` - Your Docker Hub username
   - `DOCKER_PASSWORD` - Your Docker Hub password/access token

2. **Push changes** to the `main` branch to trigger the CI/CD pipeline

## Port Configuration

- Frontend: http://localhost:30485
- Backend API: http://localhost:30980/api/

## Troubleshooting

### Login Issues
If you encounter login failures:
1. Register a new user via the registration page
2. Ensure the MySQL database is running on localhost:3306
3. Check the backend logs: `kubectl logs -l app=health-records-backend`

### Frontend-Backend Communication Issues
If the frontend cannot communicate with the backend:
1. Ensure CORS is configured correctly in `application.properties`
2. Verify the backend is accessible at http://localhost:30980/api/
3. Check network policies if using a cloud Kubernetes cluster

### Database Connection Issues
Ensure your MySQL database is running locally on port 3306 with:
- Database name: `health_records_db`
- Username: `root`
- Password: `password`