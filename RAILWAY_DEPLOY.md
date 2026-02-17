# Deploy ArunaDoc to Railway 🚂

Railway is the easiest way to deploy ArunaDoc with full backend support.

## Why Railway?

- ✅ **One-click PostgreSQL and Redis** - No configuration needed
- ✅ **Auto-deploy from GitHub** - Push and it's live
- ✅ **Free $5 monthly credit** - Perfect for MVPs
- ✅ **Automatic SSL** - HTTPS out of the box
- ✅ **Simple environment variables** - Easy secrets management
- ✅ **Great developer experience** - Modern, fast, intuitive

## 🚀 Quick Deploy (5 Minutes)

### Method 1: Web Dashboard (Easiest)

1. **Go to Railway**
   - Visit https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `marshallepie/ArunaDoc`

3. **Add Database Services**
   - Click "+ New Service"
   - Add "PostgreSQL"
   - Click "+ New Service" again
   - Add "Redis"

4. **Configure Backend Service**
   - Click on the `backend` service
   - Go to "Variables" tab
   - Add these variables:
     ```
     RAILS_ENV=production
     SECRET_KEY_BASE=<generate with: openssl rand -hex 64>
     JWT_SECRET_KEY=<generate with: openssl rand -hex 64>
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     REDIS_URL=${{Redis.REDIS_URL}}
     RAILS_MASTER_KEY=<from backend/config/master.key>
     ```

5. **Configure Frontend Service**
   - Click on the `frontend` service
   - Go to "Variables" tab
   - Add:
     ```
     VITE_API_URL=${{backend.RAILWAY_PUBLIC_DOMAIN}}
     ```

6. **Deploy**
   - Railway auto-deploys
   - Wait for builds to complete (2-3 minutes)

7. **Initialize Database**
   - Click on `backend` service
   - Go to "Settings" → "Deployments"
   - Click on latest deployment
   - Click "View Logs"
   - Run in Railway CLI:
     ```bash
     railway run rails db:migrate db:seed
     ```

8. **Access Your App**
   - Frontend URL: Click "View" on frontend service
   - Backend URL: Check backend service public domain
   - Login with: consultant@arunadoc.com / Password123!

### Method 2: Railway CLI (Faster)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create new project from repo
railway init
# Select: "Empty Project"

# 4. Link to your GitHub repo
railway link
# Follow prompts to link marshallepie/ArunaDoc

# 5. Add PostgreSQL
railway add
# Select: PostgreSQL

# 6. Add Redis
railway add
# Select: Redis

# 7. Generate secrets
echo "SECRET_KEY_BASE=$(openssl rand -hex 64)"
echo "JWT_SECRET_KEY=$(openssl rand -hex 64)"

# 8. Set environment variables for backend
railway variables set SECRET_KEY_BASE="<your-generated-secret>"
railway variables set JWT_SECRET_KEY="<your-generated-jwt-secret>"
railway variables set RAILS_ENV="production"
railway variables set RAILS_MASTER_KEY="<from backend/config/master.key>"

# 9. Deploy (push to GitHub triggers auto-deploy)
git push origin main

# 10. Wait for deployment
railway status

# 11. Run migrations
railway run --service backend rails db:migrate db:seed

# 12. Get your URLs
railway open
```

## 🔧 Environment Variables

### Backend Variables (Required)

```env
# Railway auto-provides these:
DATABASE_URL=<auto-populated by PostgreSQL service>
REDIS_URL=<auto-populated by Redis service>

# You must provide these:
RAILS_ENV=production
SECRET_KEY_BASE=<openssl rand -hex 64>
JWT_SECRET_KEY=<openssl rand -hex 64>
RAILS_MASTER_KEY=<from backend/config/master.key>
RAILS_LOG_TO_STDOUT=true
RAILS_SERVE_STATIC_FILES=true
```

### Frontend Variables (Required)

```env
VITE_API_URL=https://your-backend.railway.app
```

## 📊 Railway Services Configuration

Your Railway project will have 4 services:

1. **Backend** (Rails API)
   - Port: 3000
   - Public URL: https://arunadoc-backend-production.up.railway.app

2. **Frontend** (React app)
   - Port: 80
   - Public URL: https://arunadoc-production.up.railway.app

3. **PostgreSQL** (Database)
   - Internal only
   - Auto-connected to backend

4. **Redis** (Cache)
   - Internal only
   - Auto-connected to backend

## 🔐 Generate Secrets

Before deploying, generate these secrets:

```bash
# SECRET_KEY_BASE
openssl rand -hex 64

# JWT_SECRET_KEY
openssl rand -hex 64

# RAILS_MASTER_KEY
# This should already exist in backend/config/master.key
# If not, generate it with:
cd backend
rails credentials:edit
# Copy the key from config/master.key
```

## 🔄 Automatic Deployments

Railway automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"

# Push to GitHub
git push origin main

# Railway automatically:
# 1. Detects the push
# 2. Builds Docker images
# 3. Deploys new version
# 4. Zero-downtime deployment
```

## 📱 Custom Domain

To use your own domain:

1. Go to Railway dashboard
2. Click on your frontend service
3. Go to "Settings" → "Domains"
4. Click "Add Domain"
5. Add your custom domain (e.g., arunadoc.com)
6. Update your DNS records with Railway's values
7. Railway handles SSL automatically

## 💰 Pricing

**Free Tier:**
- $5 credit per month
- ~500 hours of service uptime
- Perfect for development/MVP

**Hobby Plan ($5/month):**
- $5 credit + pay for usage
- Good for small production apps

**Pro Plan ($20/month):**
- $20 credit + pay for usage
- For serious production apps

**Typical costs:**
- Small app: $5-10/month
- Medium traffic: $15-30/month
- High traffic: $50-100/month

## 🔍 Monitoring

### View Logs

```bash
# All services
railway logs

# Specific service
railway logs --service backend
railway logs --service frontend

# Follow logs
railway logs -f
```

### Check Status

```bash
railway status
```

### View Metrics

Go to Railway dashboard → Click service → "Metrics" tab

## 🐛 Troubleshooting

### Build Fails

```bash
# Check build logs
railway logs --service backend --deployment

# Rebuild
railway up --service backend
```

### Database Connection Issues

```bash
# Check DATABASE_URL is set
railway variables --service backend

# Test connection
railway run --service backend rails console
> ActiveRecord::Base.connection.execute("SELECT 1")
```

### Frontend Can't Connect to Backend

1. Check `VITE_API_URL` environment variable
2. Verify CORS settings in `backend/config/initializers/cors.rb`
3. Make sure backend service is running
4. Check backend logs: `railway logs --service backend`

## 🚀 Post-Deployment

After successful deployment:

1. **Test the application**
   ```bash
   curl https://your-backend.railway.app/health
   curl https://your-frontend.railway.app/
   ```

2. **Login with test account**
   - URL: https://your-frontend.railway.app
   - Email: consultant@arunadoc.com
   - Password: Password123!

3. **Set up monitoring**
   - Enable Railway's built-in monitoring
   - Consider adding Sentry for error tracking

4. **Configure backups**
   - Railway automatically backs up PostgreSQL
   - Consider additional backup solutions for critical data

5. **Set up custom domain** (optional)
   - Add your domain in Railway dashboard
   - Update DNS records
   - Railway handles SSL automatically

## 📚 Useful Commands

```bash
# Link to existing project
railway link

# Open project in browser
railway open

# Run database migrations
railway run --service backend rails db:migrate

# Access Rails console
railway run --service backend rails console

# View environment variables
railway variables

# Add new variable
railway variables set KEY=value

# Restart service
railway restart --service backend

# Delete service
railway delete --service sidekiq
```

## ✨ Benefits of Railway

1. **Zero Configuration** - Just push and deploy
2. **Auto-scaling** - Handles traffic spikes automatically
3. **Built-in PostgreSQL** - No external database needed
4. **Built-in Redis** - Cache included
5. **Free SSL** - HTTPS automatic
6. **GitHub Integration** - Auto-deploy on push
7. **Great UX** - Modern, intuitive dashboard
8. **Fair Pricing** - Only pay for what you use

## 🎯 Next Steps

1. Deploy to Railway using Method 1 or 2 above
2. Test the application thoroughly
3. Set up a custom domain (optional)
4. Configure monitoring and alerts
5. Set up automated backups
6. Go live! 🚀

---

**Railway is the recommended deployment method for ArunaDoc.** It's modern, easy to use, and handles everything you need for a production application.

Need help? Check Railway's excellent documentation: https://docs.railway.app
