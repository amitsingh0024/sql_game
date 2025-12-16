<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Reality Patch: SQL Game

A cyberpunk-themed SQL learning game built with React and Vite.

## Run Locally

**Prerequisites:** Node.js (v18 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Deploy to Render

This project is configured to deploy on Render.

### Option 1: Using render.yaml (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Go to [Render Dashboard](https://dashboard.render.com/)

3. Click "New +" and select "Blueprint"

4. Connect your repository

5. Render will automatically detect the `render.yaml` file and deploy your service

### Option 2: Manual Setup

1. Push your code to a Git repository

2. Go to [Render Dashboard](https://dashboard.render.com/)

3. Click "New +" and select "Web Service"

4. Connect your repository

5. Configure the service:
   - **Name**: `reality-patch-sql` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose your plan (Free tier available)

6. Click "Create Web Service"

### Environment Variables

No environment variables are required. The app will automatically use:
- `PORT`: Set by Render (defaults to 10000 in render.yaml)
- `NODE_ENV`: Set to `production` automatically

### Build Process

Render will:
1. Install dependencies (`npm install`)
2. Build the React app (`npm run build`)
3. Start the Express server (`npm start`)

The server serves the built static files from the `dist` directory and handles client-side routing for the React SPA.

## Project Structure

```
sql_game/
├── client/          # Client application
│   ├── components/  # React components
│   ├── data/       # Level and mission data
│   ├── utils/      # Utility functions
│   ├── questions/  # CSV question files
│   ├── server.js   # Express server for production
│   ├── render.yaml # Render deployment configuration
│   └── package.json # Dependencies and scripts
└── server/         # Backend server (if applicable)
```
