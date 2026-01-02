# Cloudflare Pages Deployment - Vanilla Frontend

This file contains the configuration for deploying the vanilla JS frontend to Cloudflare Pages.

## Quick Deploy

### Option 1: Connect GitHub Repository (Recommended)

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/?to=/:account/pages)
2. Click **"Create a project"**
3. Click **"Connect to Git"**
4. Select your GitHub repository
5. Configure build settings:
   - **Production branch**: `main`
   - **Build command**: *(leave empty)*
   - **Build output directory**: `frontend-vanilla`
   - **Root directory**: *(leave empty)*
6. Click **"Save and Deploy"**

### Option 2: Direct Upload (Quick Test)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy directly
cd frontend-vanilla
wrangler pages deploy . --project-name=wipemymail
```

## Build Settings

Since this is vanilla JS with no build step:

- **Framework preset**: None
- **Build command**: *(empty)*
- **Build output directory**: `frontend-vanilla`
- **Root directory (advanced)**: *(empty)*
- **Environment variables**: *(none needed)*

## Custom Domain Setup

After deployment:

1. Go to your Pages project
2. Click **"Custom domains"**
3. Click **"Set up a custom domain"**
4. Enter: `wipemymail.com`
5. Follow DNS instructions to add CNAME record

## Environment Configuration

No environment variables needed for the frontend!

The API endpoint is hardcoded in `js/api.js`:
```javascript
const API_BASE = 'https://temp-email-api.teleflix.online';
```

To change it, edit that file before deployment.

## Redirects & Headers

Create `_headers` file in `frontend-vanilla/` for security headers:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://temp-email-api.teleflix.online https://swiftmail-pusher.onrender.com;
```

## Automatic Deployments

Once connected to GitHub, Cloudflare Pages will:
- ✅ Auto-deploy on every push to `main`
- ✅ Create preview deployments for pull requests
- ✅ Show build logs and deployment status

## Troubleshooting

### Site shows old React version

1. Check which directory is being deployed
2. Ensure **Build output directory** is set to `frontend-vanilla`
3. Force a new deployment

### 404 errors

1. Ensure all files are in the root of `frontend-vanilla/`
2. Check that `index.html` exists
3. Verify deployment succeeded

### Assets not loading

1. Check that CSS and JS paths are relative: `css/styles.css` not `/css/styles.css`
2. Verify all files were uploaded
3. Check browser console for errors
