# Deployment Guide for Render

This guide will help you deploy the Reality Patch: SQL game to Render.

## Prerequisites

1. A GitHub, GitLab, or Bitbucket account
2. Your code pushed to a repository
3. A Render account (sign up at https://render.com)

## Quick Deploy (Using render.yaml)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create a new Web Service on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your Git repository
   - Render will automatically detect `render.yaml` and configure everything

3. **Wait for deployment**
   - Render will build and deploy your app
   - You'll get a URL like `https://your-app-name.onrender.com`

## Manual Setup (Alternative)

If you prefer to set up manually:

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository

3. **Configure Service**
   - **Name**: `reality-patch-sql` (or your choice)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (or set if your app is in a subdirectory)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free tier is available

4. **Environment Variables**
   - No additional variables needed
   - `PORT` is automatically set by Render
   - `NODE_ENV` is set to `production`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete (usually 2-5 minutes)

## How It Works

1. **Build Phase**: 
   - Render runs `npm install` to install dependencies
   - Then runs `npm run build` to create the production build in `dist/`

2. **Start Phase**:
   - Runs `npm start` which executes `server.js`
   - Express server serves static files from `dist/`
   - Handles client-side routing for React SPA

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version (Render uses Node 18+ by default)
- Check build logs in Render dashboard

### App Doesn't Load
- Verify `dist/` folder is created during build
- Check that `server.js` is in the root directory
- Ensure `start` script is in `package.json`

### Routing Issues
- The server.js handles client-side routing
- All routes return `index.html` for React Router

## Custom Domain (Optional)

1. In your Render service settings
2. Go to "Custom Domains"
3. Add your domain
4. Follow DNS configuration instructions

## Auto-Deploy

Render automatically deploys when you push to your connected branch. You can disable this in service settings if needed.

## Monitoring

- View logs in the Render dashboard
- Set up alerts for deployment failures
- Monitor service health and uptime

## Cost

- **Free Tier**: 750 hours/month (enough for most projects)
- **Paid Plans**: Start at $7/month for always-on services


