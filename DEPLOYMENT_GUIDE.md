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
The frontend will automatically connect to the backend service when deployed via [`render.yaml`](render.yaml:14). The `VITE_API_BASE_URL` is automatically set using Render's service-to-service communication.

**Local Development:**
- Uses [`frontend/.env`](frontend/.env:1) with `VITE_API_BASE_URL=http://localhost:8000`

**Production:**
- Uses [`frontend/.env.production`](frontend/.env.production:1)
- `VITE_API_BASE_URL` is automatically set by Render to point to the backend service
- Frontend URL: `https://pathlight-v2-frontend.onrender.com`

### Backend
Set these environment variables in Render dashboard or via [`render.yaml`](render.yaml:27):

**Required:**
- `DATABASE_URL` - MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)
- `GEMINI_API_KEY` - Google Gemini API key (get from https://makersuite.google.com/app/apikey)

**Optional (with defaults):**
- `LLM_PROVIDER` - AI provider to use (default: `gemini`)
- `GEMINI_MODEL` - Gemini model version (default: `gemini-2.5-flash`)
- `ANTHROPIC_API_KEY` - Claude API key (optional)
- `CLAUDE_MODEL` - Claude model version (default: `claude-3-5-haiku-20241022`)
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `OPENAI_MODEL` - OpenAI model version (default: `gpt-4o-mini`)

**CORS Configuration:**
The backend is pre-configured in [`backend/main.py`](backend/main.py:28) to allow:
- Local development: `http://localhost:5173`, `http://localhost:3000`, etc.
- Production: `https://pathlight-v2-frontend.onrender.com`

## Deployment Steps

### Option 1: Using Render.yaml (Recommended)
1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Configure production environment"
   git push origin main
   ```

2. **Connect repository to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect [`render.yaml`](render.yaml:1) automatically

3. **Configure Environment Variables**
   
   For the **backend service** (`pathlight-backend`), set these in Render dashboard:
   - `DATABASE_URL` - Your MongoDB connection string
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - (Optional) `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` if using other providers

   The frontend service will automatically receive `VITE_API_BASE_URL` from the backend service.

4. **Deploy**
   - Click "Apply" to create both services
   - Render will build and deploy both frontend and backend
   - Frontend will be available at: `https://pathlight-v2-frontend.onrender.com`
   - Backend will be available at: `https://pathlight-backend.onrender.com`

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
- Backend CORS is pre-configured in [`backend/main.py`](backend/main.py:28) for production URL
- If using a different frontend URL, update the `allow_origins` list in [`backend/main.py`](backend/main.py:28)
- Verify `VITE_API_BASE_URL` points to the correct backend URL (automatically set by Render)

### Environment Variable Issues
- Ensure all required environment variables are set in Render dashboard
- Check Render logs for missing environment variable errors
- Verify `DATABASE_URL` format matches MongoDB connection string requirements
- Confirm API keys are valid and have proper permissions

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