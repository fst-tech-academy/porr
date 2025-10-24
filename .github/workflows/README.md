# GitHub Actions Workflow for NPST

This document describes the GitHub Actions workflow configuration for the New Project Starter Template (NPST) project.

## Workflow File

**File**: `.github/workflows/github-actions-NPST.yml`

## Workflow Overview

The workflow is triggered on pushes to the `develop` branch and performs the following actions:

### 1. Explore-GitHub-Actions Job

**Purpose**: Basic repository setup and dependency installation

**Steps**:
- Checkout repository code
- Set up Node.js 20 environment
- Install server dependencies (`npm ci`)
- Install client dependencies (`npm ci`)
- Test database connection to remote NPST database
- List repository files

**Environment Variables**:
- `MONGODB_URI`: Remote database connection string

### 2. build-push-docker-images Job

**Purpose**: Build and push Docker images to Docker Hub

**Dependencies**: Runs after Explore-GitHub-Actions job completes

**Steps**:
- Checkout repository code
- Login to Docker Hub using secrets
- Build and push backend Docker image (`asdini/NPST-backend:latest`)
- Build and push frontend Docker image (`asdini/NPST-frontend:latest`)

**Environment Variables**:
- Backend: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`
- Frontend: `REACT_APP_API_URL`

## Required Secrets

Configure the following secrets in your GitHub repository settings:

### Docker Hub Secrets
- `DOCKERHUB_USERNAME`: Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token

### Application Secrets
- `JWT_SECRET`: JWT secret for authentication
- `REACT_APP_API_URL`: Frontend API URL

## Database Configuration

The workflow uses the remote NPST database:
- **Host**: 130.255.30.153:27017
- **Database**: NPST
- **Authentication**: cscs_user / Friday14=
- **Auth Source**: admin

## Docker Images

The workflow builds and pushes the following Docker images:

### Backend Image
- **Repository**: `asdini/NPST-backend`
- **Tag**: `latest`
- **Build Context**: `server/` directory

### Frontend Image
- **Repository**: `asdini/NPST-frontend`
- **Tag**: `latest`
- **Build Context**: `client/` directory

## Workflow Triggers

- **Push to develop branch**: Automatically triggers the workflow
- **Manual trigger**: Can be triggered manually from GitHub Actions tab

## Testing

The workflow includes database connection testing to ensure:
- Remote database is accessible
- User model works correctly
- Admin user exists
- Connection is stable

## Deployment

After successful build and push:
1. Docker images are available on Docker Hub
2. Images can be deployed to production environments
3. Backend image includes remote database configuration
4. Frontend image includes API URL configuration

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if remote database is accessible
   - Verify authentication credentials
   - Ensure network connectivity

2. **Docker Build Failed**
   - Check Dockerfile syntax
   - Verify build context
   - Check for missing dependencies

3. **Docker Push Failed**
   - Verify Docker Hub credentials
   - Check repository permissions
   - Ensure Docker Hub token is valid

### Debug Steps

1. Check workflow logs in GitHub Actions tab
2. Verify secrets are properly configured
3. Test database connection manually
4. Test Docker build locally
5. Verify Docker Hub access

## Security Considerations

1. **Secrets Management**: All sensitive data is stored in GitHub Secrets
2. **Database Credentials**: Remote database credentials are embedded in workflow
3. **Docker Hub Access**: Uses secure token-based authentication
4. **Environment Variables**: Production environment variables are properly configured

## Customization

To customize the workflow:

1. **Change Trigger Branches**: Modify the `on.push.branches` section
2. **Add More Tests**: Add additional test steps in the Explore-GitHub-Actions job
3. **Change Docker Registry**: Update Docker Hub references to use different registry
4. **Add Deployment**: Add deployment steps after successful build
5. **Environment-Specific**: Add different configurations for different environments

## Monitoring

Monitor the workflow execution:
- Check GitHub Actions tab for workflow status
- Review logs for any errors or warnings
- Verify Docker images are pushed successfully
- Test database connectivity in production

## Next Steps

1. Configure required secrets in GitHub repository
2. Test the workflow by pushing to develop branch
3. Verify Docker images are built and pushed
4. Set up production deployment using the Docker images
5. Monitor workflow execution and fix any issues
