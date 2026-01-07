# Deployment Guide for Pathlight

## Overview
This guide covers deploying the Pathlight application to production environments, specifically Render.com.

## Issues Fixed

### 1. Rollup Native Binaries Issue
**Problem:** Missing `@rollup/rollup-linux-x64-gnu` module on Linux build servers.

**Solution:**
- Added explicit `optionalDependencies` in [`package.json`](frontend/package.json:66)
- Created [`.npmrc`](frontend/.npmrc:1) to force installation of optional dependencies
- Updated build command to clean install: `rm -rf node_modules package-lock.json && npm install && npm run build`

### 2. Port Configuration
**Problem:** Development server ran on port 5173, but production expected port 8000.

**Solution:**
- Updated [`vite.config.ts`](frontend/vite.config.ts:13) to use port 5173 for dev
- Added preview configuration to use `$PORT` environment variable or default to 8000
- Backend API URL configured via `VITE_API_BASE_URL` environment variable

## Deployment Configuration

### Render.yaml
Created [`render.yaml`](render.yaml:1) with two services:

#### Frontend Service
- **Type:** Static Site / Web Service
- **Runtime:** Node.js 22.16.0
- **Build Command:** `rm -rf node_modules package-lock.json && npm install && npm run build`
- **Start Command:** `npm run preview -- --host 0.0.0.0 --port $PORT`
- **Root Directory:** `frontend`

#### Backend Service
- **Type:** Web Service
- **Runtime:** Python 3.11.0
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Root Directory:** `backend`

## Environment Variables

### Frontend
Set these in Render dashboard:
- `VITE_API_BASE_URL` - URL of your backend service (e.g., `https://pathlight-backend.onrender.com`)

### Backend
Set these in Render dashboard:
- `MONGODB_URI` - MongoDB connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `JWT_SECRET_KEY` - Secret key for JWT tokens

## Deployment Steps

### Option 1: Using Render.yaml (Recommended)
1. Push code to GitHub
2. Connect repository to Render
3. Render will automatically detect `render.yaml` and create both services
4. Set environment variables in Render dashboard
5. Deploy

### Option 2: Manual Setup
1. Create Frontend Service:
   - New → Static Site
   - Connect GitHub repository
   - Root Directory: `frontend`
   - Build Command: `rm -rf node_modules package-lock.json && npm install && npm run build`
   - Publish Directory: `dist`

2. Create Backend Service:
   - New → Web Service
   - Connect GitHub repository
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. Set environment variables for both services

## Local Testing

### Test Production Build
```bash
cd frontend
npm run build
npm run preview
```

The preview server will run on port 8000 (or `$PORT` if set).

### Test Backend
```bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

## Troubleshooting

### Build Fails with Rollup Error
- Ensure `.npmrc` exists in frontend directory
- Verify `optionalDependencies` includes `@rollup/rollup-linux-x64-gnu`
- Try the clean install command: `rm -rf node_modules package-lock.json && npm install`

### Port Conflicts
- Development: Uses port 5173
- Production Preview: Uses port 8000 or `$PORT`
- Backend: Uses port 8000 or `$PORT`

### CORS Issues
- Ensure backend CORS configuration includes frontend URL
- Update `VITE_API_BASE_URL` to point to correct backend URL

## Performance Optimization

The build configuration includes:
- Code splitting for vendor and UI libraries
- Gzip compression
- Source maps only in development mode
- Manual chunks for better caching

## Security Considerations

1. Never commit `.env` files
2. Use Render's environment variable management
3. Rotate JWT secrets regularly
4. Use HTTPS in production (Render provides this automatically)

## Monitoring

After deployment:
1. Check Render logs for any errors
2. Monitor build times and memory usage
3. Set up health checks (configured in render.yaml)
4. Monitor API response times

## Rollback Procedure

If deployment fails:
1. Go to Render dashboard
2. Select the service
3. Click "Rollback" to previous deployment
4. Investigate logs to identify issue

## Support

For issues:
1. Check Render logs
2. Review this deployment guide
3. Check GitHub issues
4. Contact support if needed