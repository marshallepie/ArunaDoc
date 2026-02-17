# Railway Deployment - Step by Step 🚂

## Issue: Monorepo Structure

Railway couldn't auto-detect the Dockerfiles because we have a monorepo with separate `backend/` and `frontend/` directories. Here's how to deploy properly:

## ✅ Correct Railway Setup (5 Minutes)

### Step 1: Create Empty Project

1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click **"New Project"**
4. Select **"Empty Project"**
5. Name it: `ArunaDoc`

### Step 2: Add PostgreSQL

1. Click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Done! Railway auto-configures the connection

### Step 3: Add Redis

1. Click **"+ New"**
2. Select **"Database"** → **"Add Redis"**
3. Done! Auto-configured

### Step 4: Add Backend Service

1. Click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose **`marshallepie/ArunaDoc`**
4. Railway creates a service
5. Click on the new service
6. Go to **"Settings"** tab
7. Under **"Source"**:
   - **Root Directory:** Enter `backend`
   - **Watch Paths:** Leave default or set to `backend/**`
8. Scroll down to **"Deploy"**
   - Railway should detect the Dockerfile automatically
9. Go to **"Variables"** tab
10. Click **"+ New Variable"** and add these:

```
RAILS_ENV=production
RAILS_LOG_TO_STDOUT=true
RAILS_SERVE_STATIC_FILES=true
SECRET_KEY_BASE=<see below>
JWT_SECRET_KEY=<see below>
RAILS_MASTER_KEY=<see below>
```

### Step 5: Add Frontend Service

1. Click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose **`marshallepie/ArunaDoc`** again
4. Click on the new service
5. Go to **"Settings"** tab
6. Under **"Source"**:
   - **Root Directory:** Enter `frontend`
   - **Watch Paths:** Leave default or set to `frontend/**`
7. Go to **"Variables"** tab
8. Add:

```
VITE_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
```

Note: Railway will auto-replace `${{backend.RAILWAY_PUBLIC_DOMAIN}}` with your backend's URL

### Step 6: Generate Secrets

Run these commands locally to generate secrets:

```bash
# SECRET_KEY_BASE
openssl rand -hex 64

# JWT_SECRET_KEY
openssl rand -hex 64

# RAILS_MASTER_KEY
cat backend/config/master.key
# If file doesn't exist, generate with:
# cd backend && EDITOR=nano rails credentials:edit
# Then copy the key from config/master.key
```

Copy each secret and add it to the backend service's variables in Railway.

### Step 7: Deploy

1. Railway automatically deploys when you add the services
2. Watch the build logs in each service
3. Wait 2-3 minutes for builds to complete

### Step 8: Initialize Database

Once backend is deployed:

**Option A: Railway Dashboard**
1. Click on **backend** service
2. Go to **"Settings"** → scroll to **"Service"**
3. Copy the **"Service ID"**
4. Use Railway CLI (see Option B)

**Option B: Railway CLI** (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link
# Select your ArunaDoc project

# Run migrations on backend service
railway run --service backend rails db:migrate

# Seed database
railway run --service backend rails db:seed
```

### Step 9: Get Your URLs

1. Click on **frontend** service
2. Go to **"Settings"** → **"Networking"**
3. Click **"Generate Domain"**
4. Your app URL: `https://arunadoc-production.up.railway.app`

5. Click on **backend** service
6. Go to **"Settings"** → **"Networking"**
7. Click **"Generate Domain"**
8. Your API URL: `https://arunadoc-backend-production.up.railway.app`

### Step 10: Test Your App

1. Visit your frontend URL
2. Login with:
   - Email: `consultant@arunadoc.com`
   - Password: `Password123!`

## 🔧 Railway Service Configuration

Your Railway project should have **4 services**:

```
ArunaDoc (Project)
├── backend (Rails API)
│   ├── Root: backend/
│   ├── Dockerfile: backend/Dockerfile
│   └── Port: 3000
├── frontend (React)
│   ├── Root: frontend/
│   ├── Dockerfile: frontend/Dockerfile
│   └── Port: 80
├── postgres (Database)
│   └── Auto-configured
└── redis (Cache)
    └── Auto-configured
```

## 📊 Environment Variables Reference

### Backend Service

Railway auto-provides these (no action needed):
- `DATABASE_URL` - From PostgreSQL service
- `REDIS_URL` - From Redis service

You must add these manually:
```env
RAILS_ENV=production
RAILS_LOG_TO_STDOUT=true
RAILS_SERVE_STATIC_FILES=true
SECRET_KEY_BASE=<generated-64-char-hex>
JWT_SECRET_KEY=<generated-64-char-hex>
RAILS_MASTER_KEY=<from-backend/config/master.key>
```

### Frontend Service

```env
VITE_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
```

Railway automatically replaces `${{backend.RAILWAY_PUBLIC_DOMAIN}}` with your backend's actual URL.

## 🐛 Troubleshooting

### Build Failed - Can't Find Dockerfile

**Solution:** Make sure **Root Directory** is set correctly:
- Backend: `backend`
- Frontend: `frontend`

### Backend Won't Start

**Check logs:**
1. Click on backend service
2. Go to **"Deployments"** tab
3. Click on latest deployment
4. View build and deploy logs

**Common issues:**
- Missing environment variables (add them in Variables tab)
- RAILS_MASTER_KEY incorrect (regenerate or check the file)
- Database not connected (Railway should auto-connect)

### Frontend Can't Connect to Backend

**Check:**
1. Backend service has a public domain generated
2. Frontend `VITE_API_URL` uses Railway's variable syntax: `${{backend.RAILWAY_PUBLIC_DOMAIN}}`
3. CORS is configured in `backend/config/initializers/cors.rb`

### Database Connection Failed

Railway auto-configures `DATABASE_URL`. If it fails:
1. Click PostgreSQL service
2. Go to **"Variables"** tab
3. Copy `DATABASE_URL`
4. Add it manually to backend service if needed

## 🚀 Auto-Deploy

Railway automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"

# Push to GitHub
git push origin main

# Railway automatically:
# 1. Detects push
# 2. Builds Docker images
# 3. Deploys with zero downtime
```

## 💰 Cost Estimate

**Free Tier:**
- $5 credit/month
- ~500 hours uptime
- Perfect for MVP/development

**Expected usage:**
- Backend: ~$3-5/month
- Frontend: ~$1-2/month
- PostgreSQL: ~$2-3/month
- Redis: ~$1-2/month
- **Total:** ~$7-12/month

## ✅ Success Checklist

- [ ] Empty project created
- [ ] PostgreSQL added
- [ ] Redis added
- [ ] Backend service added with root directory set to `backend`
- [ ] Frontend service added with root directory set to `frontend`
- [ ] Backend environment variables configured
- [ ] Frontend environment variables configured
- [ ] Both services deployed successfully
- [ ] Database migrations run
- [ ] Frontend and backend domains generated
- [ ] App tested and working

## 🎉 You're Live!

Once everything is deployed:
- Your app is accessible at your Railway domain
- SSL/HTTPS is automatic
- Auto-deploys on every git push
- Logs and metrics available in dashboard

---

Need help? Railway has excellent support in their Discord: https://discord.gg/railway
